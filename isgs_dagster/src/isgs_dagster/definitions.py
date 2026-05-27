import dagster as dg

from isgs_dagster.defs.data_logger import data_logger
from isgs_dagster.resources import PostgresResource, RustFSResource

defs = dg.Definitions(
    assets=[data_logger],
    resources={
        "postgres": PostgresResource(),
        "rustfs": RustFSResource(),
    },
)