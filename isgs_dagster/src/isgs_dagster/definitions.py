import dagster as dg

from isgs_dagster.defs.data_logger import data_logger
from isgs_dagster.defs.lab_results import lab_results
from isgs_dagster.defs.station_visit_import_queue_sensor import station_visit_import_queue_sensor, imported_file
from isgs_dagster.defs.visit_labs_import_queue_sensor import visit_labs_import_queue_sensor, import_lab_results
from isgs_dagster.resources import PostgresResource, RustFSResource

defs = dg.Definitions(
    assets=[data_logger, lab_results],
    jobs=[imported_file, import_lab_results],
    sensors=[station_visit_import_queue_sensor, visit_labs_import_queue_sensor],
    resources={
        "postgres": PostgresResource(),
        "rustfs": RustFSResource(),
    },
)