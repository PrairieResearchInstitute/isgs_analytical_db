import dagster as dg

from isgs_dagster.resources import PostgresResource

import_lab_results = dg.define_asset_job(
    name="import_lab_results",
    selection=["lab_results"],
)


@dg.sensor(job=import_lab_results, minimum_interval_seconds=30)
def visit_labs_import_queue_sensor(context: dg.SensorEvaluationContext, postgres: PostgresResource):
    last_timestamp = context.cursor or "1970-01-01T00:00:00"

    with postgres.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, visit_id, uri, timestamp
                FROM visit_labs_import_queue
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
    for row_id, visit_id, uri, ts in rows:
        run_requests.append(
            dg.RunRequest(
                run_key=str(row_id),
                run_config={
                    "ops": {
                        "lab_results": {
                            "config": {
                                "visit_id": visit_id,
                                "uri": uri,
                            }
                        }
                    }
                },
                tags={
                    "visit_labs_import_queue_id": str(row_id),
                    "visit_id": str(visit_id),
                    "uri": uri,
                },
            )
        )
        latest_ts = ts.isoformat()

    return dg.SensorResult(run_requests=run_requests, cursor=latest_ts)