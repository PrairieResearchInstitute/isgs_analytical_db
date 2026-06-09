import csv
import io
from datetime import datetime
from urllib.parse import urlparse

import dagster as dg

from isgs_dagster.resources import PostgresResource, RustFSResource


class DataLoggerConfig(dg.Config):
    station_visit_id: int
    uri: str  # s3://bucket/path/to/file.csv


def detect_format(content: str) -> str:
    return "diver" if content.split("\n", 1)[0].strip() == "Data file for DataLogger." else "ins"


def parse_diver_rows(content: str, station_visit_id: int) -> list[tuple]:
    rows: list[tuple] = []
    reader = csv.reader(io.StringIO(content))
    header_found = False
    for row in reader:
        if not header_found:
            if row and row[0].strip().startswith("Date/time"):
                header_found = True
            continue
        if len(row) >= 3 and row[2].strip():
            dt = datetime.strptime(row[0].strip(), "%Y/%m/%d %H:%M:%S")
            rows.append((station_visit_id, dt, float(row[2].strip())))
    return rows


def parse_ins_rows(content: str, station_visit_id: int) -> list[tuple]:
    rows: list[tuple] = []
    reader = csv.reader(io.StringIO(content))
    header_found = False
    for row in reader:
        if not header_found:
            if row and row[0].strip().startswith("Date Time"):
                header_found = True
            continue
        if len(row) >= 4:
            ts = datetime.strptime(row[0].strip(), "%Y-%m-%d %H:%M:%S.%f")
            rows.append((
                station_visit_id,
                ts,
                float(row[1]),
                float(row[2]),
                float(row[3]),
            ))
    return rows


@dg.asset
def data_logger(
    context: dg.AssetExecutionContext,
    config: DataLoggerConfig,
    postgres: PostgresResource,
    rustfs: RustFSResource,
) -> dg.MaterializeResult:
    parsed = urlparse(config.uri)
    bucket = parsed.netloc
    key = parsed.path.lstrip("/")

    s3 = rustfs.get_s3_client()
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response["Body"].read().decode("utf-8", errors="replace")

    fmt = detect_format(content)
    conn = postgres.get_connection()
    try:
        with conn.cursor() as cur:
            if fmt == "diver":
                rows = parse_diver_rows(content, config.station_visit_id)
                cur.execute(
                    "DELETE FROM temperatures WHERE station_visit_id = %s",
                    (config.station_visit_id,),
                )
                cur.executemany(
                    "INSERT INTO temperatures (station_visit_id, datetime, temperature_celsius) "
                    "VALUES (%s, %s, %s)",
                    rows,
                )
            else:
                rows = parse_ins_rows(content, config.station_visit_id)
                cur.execute(
                    "DELETE FROM pressure_temperature_depth WHERE station_visit_id = %s",
                    (config.station_visit_id,),
                )
                cur.executemany(
                    "INSERT INTO pressure_temperature_depth "
                    "(station_visit_id, timestamp, pressure, temperature, depth) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    rows,
                )
        conn.commit()
    finally:
        conn.close()

    context.log.info(
        f"Inserted {len(rows)} rows for station_visit_id={config.station_visit_id} (format={fmt})"
    )
    return dg.MaterializeResult(
        metadata={"rows_inserted": len(rows), "uri": config.uri, "format": fmt}
    )