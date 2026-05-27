import dagster as dg

from isgs_dagster.resources import PostgresResource, RustFSResource


@dg.asset
def data_logger(
    context: dg.AssetExecutionContext,
    postgres: PostgresResource,
    rustfs: RustFSResource,
) -> None:
    """Ingest a CSV file from RustFS into the IDOT PostgreSQL database. Not yet implemented."""
    context.log.info("data_logger: stub — implementation pending")