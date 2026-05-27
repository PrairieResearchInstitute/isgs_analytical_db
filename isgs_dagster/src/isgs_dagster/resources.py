import psycopg2
import dagster as dg


class PostgresResource(dg.ConfigurableResource):
    database_url: str = dg.EnvVar("DATABASE_URL")

    def get_connection(self):
        return psycopg2.connect(self.database_url)


class RustFSResource(dg.ConfigurableResource):
    endpoint: str = dg.EnvVar("RUSTFS_ENDPOINT")
    access_key: str = dg.EnvVar("RUSTFS_ACCESS_KEY")
    secret_key: str = dg.EnvVar("RUSTFS_SECRET_KEY")