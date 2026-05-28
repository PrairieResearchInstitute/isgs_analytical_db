import csv
import io
from urllib.parse import urlparse

import dagster as dg

from isgs_dagster.resources import PostgresResource, RustFSResource


class PtdLoggerConfig(dg.Config):
    station_visit_id: int
    uri: str  # s3://bucket/path/to/file.csv


@dg.asset
def ptd_logger(
    context: dg.AssetExecutionContext,
    config: PtdLoggerConfig,
    postgres: PostgresResource,
    rustfs: RustFSResource,
) -> dg.MaterializeResult:
    parsed = urlparse(config.uri)
    bucket = parsed.netloc
    key = parsed.path.lstrip("/")

    s3 = rustfs.get_s3_client()
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response["Body"].read().decode("utf-8")

    reader = csv.reader(io.StringIO(content))
    rows: list[tuple] = []
    header_found = False
    for row in reader:
        if not header_found:
            if row and row[0].strip().startswith("Date Time"):
                header_found = True
            continue
        if len(row) >= 4:
            rows.append((
                config.station_visit_id,
                float(row[1]),
                float(row[2]),
                float(row[3]),
            ))

    conn = postgres.get_connection()
    try:
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO pressure_temperature_depth "
                "(station_visit_id, pressure, temperature, depth) "
                "VALUES (%s, %s, %s, %s)",
                rows,
            )
        conn.commit()
    finally:
        conn.close()

    context.log.info(f"Inserted {len(rows)} rows for station_visit_id={config.station_visit_id}")
    return dg.MaterializeResult(
        metadata={"rows_inserted": len(rows), "uri": config.uri}
    )