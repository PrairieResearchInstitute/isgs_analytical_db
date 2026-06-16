import csv
import io
import re
from datetime import datetime
from urllib.parse import urlparse

import dagster as dg

from isgs_dagster.resources import PostgresResource, RustFSResource


class SondeDataConfig(dg.Config):
    sample_id: int
    uri: str  # s3://bucket/path/to/file.csv


def _parse_float_prefix(value: str) -> float | None:
    """Extract the leading number from strings like '400 ml/min'."""
    m = re.match(r"^\s*([-\d.]+)", value)
    return float(m.group(1)) if m else None


def parse_vusitu(content: str, sample_id: int):
    """Return (metadata_dict, data_rows list-of-tuples)."""
    meta = {
        "pump_type": None,
        "flow_rate": None,
        "final_flow_rate": None,
        "tubing_type": None,
        "device_model": None,
        "device_sn": None,
        "notes": None,
    }

    data_rows: list[tuple] = []
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)

    header_found = False
    notes_mode = False
    notes_lines: list[str] = []

    for i, row in enumerate(rows):
        if not row:
            notes_mode = False
            continue

        cell = row[0].strip()

        if notes_mode:
            if cell:
                notes_lines.append(cell)
            if len(notes_lines) >= 2:
                notes_mode = False
            continue

        if header_found:
            if len(row) < 20 or not row[0].strip():
                continue
            try:
                ts_str = row[0].strip()
                # timestamp may be "2026-04-20 10:35:27" (no microseconds)
                ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                elapsed = row[1].strip()

                def _f(idx):
                    v = row[idx].strip()
                    return float(v) if v else None

                data_rows.append((
                    sample_id,
                    ts,
                    elapsed,
                    _f(2),   # flow
                    _f(3),   # actual_conductivity
                    _f(4),   # specific_conductivity
                    _f(5),   # salinity
                    _f(6),   # resistivity
                    _f(7),   # density
                    _f(8),   # total_dissolved_solids
                    _f(9),   # turbidity
                    _f(10),  # ph
                    _f(11),  # ph_mv
                    _f(12),  # orp
                    _f(13),  # rdo_concentration
                    _f(14),  # rdo_saturation
                    _f(15),  # oxygen_partial_pressure
                    _f(16),  # temperature
                    _f(17),  # external_voltage
                    _f(18),  # battery_capacity
                    _f(19),  # barometric_pressure
                ))
            except (ValueError, IndexError):
                continue
            continue

        if cell.startswith("Date Time"):
            header_found = True
            continue

        if "=" in cell and len(row) == 1:
            key, _, val = cell.partition("=")
            key = key.strip().lower()
            val = val.strip()
            if key == "pump type":
                meta["pump_type"] = val
            elif key == "flow rate":
                meta["flow_rate"] = _parse_float_prefix(val)
            elif key == "final flow rate":
                meta["final_flow_rate"] = _parse_float_prefix(val)
            elif key == "tubing type":
                meta["tubing_type"] = val
            elif key == "device model":
                meta["device_model"] = val
            elif key == "device sn":
                meta["device_sn"] = val
            continue

        if cell == "Notes":
            notes_mode = True
            notes_lines = []
            continue

    if notes_lines:
        meta["notes"] = "\n".join(notes_lines)

    return meta, data_rows


@dg.asset
def sonde_data(
    context: dg.AssetExecutionContext,
    config: SondeDataConfig,
    postgres: PostgresResource,
    rustfs: RustFSResource,
) -> dg.MaterializeResult:
    parsed = urlparse(config.uri)
    bucket = parsed.netloc
    key = parsed.path.lstrip("/")

    s3 = rustfs.get_s3_client()
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response["Body"].read().decode("utf-8", errors="replace")

    meta, data_rows = parse_vusitu(content, config.sample_id)

    conn = postgres.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM sonde_data WHERE sample_id = %s", (config.sample_id,))
            if data_rows:
                cur.executemany(
                    """
                    INSERT INTO sonde_data (
                        sample_id, timestamp, elapsed_time, flow,
                        actual_conductivity, specific_conductivity, salinity,
                        resistivity, density, total_dissolved_solids, turbidity,
                        ph, ph_mv, orp, rdo_concentration, rdo_saturation,
                        oxygen_partial_pressure, temperature, external_voltage,
                        battery_capacity, barometric_pressure
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    """,
                    data_rows,
                )
            cur.execute(
                """
                UPDATE samples SET
                    pump_type = %s,
                    flow_rate = %s,
                    final_flow_rate = %s,
                    tubing_type = %s,
                    device_model = %s,
                    device_sn = %s,
                    notes = COALESCE(%s, notes)
                WHERE id = %s
                """,
                (
                    meta["pump_type"],
                    meta["flow_rate"],
                    meta["final_flow_rate"],
                    meta["tubing_type"],
                    meta["device_model"],
                    meta["device_sn"],
                    meta["notes"],
                    config.sample_id,
                ),
            )
        conn.commit()
    finally:
        conn.close()

    context.log.info(
        f"Inserted {len(data_rows)} sonde rows for sample_id={config.sample_id}"
    )
    return dg.MaterializeResult(
        metadata={"rows_inserted": len(data_rows), "uri": config.uri, **{k: str(v) for k, v in meta.items()}}
    )