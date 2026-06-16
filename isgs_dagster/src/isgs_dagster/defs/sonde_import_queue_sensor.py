import dagster as dg

from isgs_dagster.resources import PostgresResource

sonde_imported_file = dg.define_asset_job(
    name="sonde_imported_file",
    selection=["sonde_data"],
)


@dg.sensor(job=sonde_imported_file, minimum_interval_seconds=30)
def sonde_import_queue_sensor(context: dg.SensorEvaluationContext, postgres: PostgresResource):
    last_timestamp = context.cursor or "1970-01-01T00:00:00"

    with postgres.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, sample_id, uri, timestamp
                FROM sonde_import_queue
                WHERE timestamp > %s
                ORDER BY timestamp ASC
                """,
                (last_timestamp,),
            )
            rows = cur.fetchall()

    if not rows:
        return

    run_requests = []
    latest_ts = last_timestamp
    for row_id, sample_id, uri, ts in rows:
        run_requests.append(
            dg.RunRequest(
                run_key=str(row_id),
                run_config={
                    "ops": {
                        "sonde_data": {
                            "config": {
                                "sample_id": sample_id,
                                "uri": uri,
                            }
                        }
                    }
                },
                tags={
                    "sonde_import_queue_id": str(row_id),
                    "sample_id": str(sample_id),
                    "uri": uri,
                },
            )
        )
        latest_ts = ts.isoformat()

    return dg.SensorResult(run_requests=run_requests, cursor=latest_ts)