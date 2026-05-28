import dagster as dg

from isgs_dagster.defs.ptd_logger import ptd_logger
from isgs_dagster.defs.import_queue_sensor import import_queue_sensor, imported_file
from isgs_dagster.resources import PostgresResource, RustFSResource

defs = dg.Definitions(
    assets=[ptd_logger],
    jobs=[imported_file],
    sensors=[import_queue_sensor],
    resources={
        "postgres": PostgresResource(),
        "rustfs": RustFSResource(),
    },
)