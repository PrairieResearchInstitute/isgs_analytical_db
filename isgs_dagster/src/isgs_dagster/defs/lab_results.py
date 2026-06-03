import io
from datetime import datetime
from urllib.parse import urlparse

import dagster as dg
import openpyxl

from isgs_dagster.resources import PostgresResource, RustFSResource

EXPECTED_HEADERS = [
    "Analytical_Batch",
    "Lab_Name",
    "Date",
    "Sample_Number",
    "QC_Type",
    "Parameter_Name",
    "Result_Qualifier",
    "Result_Recovery",
    "Corr_Result_Recovery",
    "Unit",
    "Note",
]


class LabResultsConfig(dg.Config):
    visit_id: int
    uri: str


def _col(headers: dict[str, int], name: str) -> int:
    return headers[name]


def _cell(row, idx: int):
    return row[idx].value if idx < len(row) else None


@dg.asset
def lab_results(
    context: dg.AssetExecutionContext,
    config: LabResultsConfig,
    postgres: PostgresResource,
    rustfs: RustFSResource,
) -> dg.MaterializeResult:
    parsed = urlparse(config.uri)
    s3 = rustfs.get_s3_client()
    content = s3.get_object(Bucket=parsed.netloc, Key=parsed.path.lstrip("/"))["Body"].read()

    wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    ws = wb.worksheets[0]
    context.log.info(f"Reading sheet: {ws.title}")

    rows_iter = ws.iter_rows()
    header_row = next(rows_iter)
    headers: dict[str, int] = {
        str(cell.value).strip(): cell.column - 1
        for cell in header_row
        if cell.value is not None
    }

    sample_rows: dict[str, list[tuple]] = {}
    for row in rows_iter:
        sample_number = _cell(row, _col(headers, "Sample_Number"))
        if sample_number is None:
            continue
        sample_number = str(sample_number).strip()

        raw_date = _cell(row, _col(headers, "Date"))
        date_val = raw_date if isinstance(raw_date, datetime) else None

        record = (
            _cell(row, _col(headers, "Lab_Name")),
            date_val,
            _cell(row, _col(headers, "QC_Type")),
            _cell(row, _col(headers, "Parameter_Name")),
            _cell(row, _col(headers, "Result_Qualifier")),
            _cell(row, _col(headers, "Result_Recovery")),
            _cell(row, _col(headers, "Corr_Result_Recovery")),
            _cell(row, _col(headers, "Unit")),
            _cell(row, _col(headers, "Note")),
        )
        sample_rows.setdefault(sample_number, []).append(record)

    conn = postgres.get_connection()
    samples_processed = 0
    samples_skipped = 0
    rows_inserted = 0
    try:
        with conn.cursor() as cur:
            for sample_number, records in sample_rows.items():
                cur.execute(
                    """
                    SELECT s.id FROM samples s
                    JOIN station_visits sv ON s.station_visit_id = sv.id
                    WHERE sv.visit_id = %s AND s.sample_name = %s
                    """,
                    (config.visit_id, sample_number),
                )
                result = cur.fetchone()
                if result is None:
                    context.log.warning(
                        f"Sample '{sample_number}' not found in DB for visit_id={config.visit_id}, skipping"
                    )
                    samples_skipped += 1
                    continue

                sample_id = result[0]
                cur.execute("DELETE FROM lab_result WHERE sample_id = %s", (sample_id,))
                cur.executemany(
                    """
                    INSERT INTO lab_result
                      (sample_id, lab_name, date, qc_type, parameter_name,
                       result_qualifier, result_recovery, corr_result_recovery, unit, note)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [(sample_id, *rec) for rec in records],
                )
                rows_inserted += len(records)
                samples_processed += 1

        conn.commit()
    finally:
        conn.close()

    context.log.info(
        f"Processed {samples_processed} samples, skipped {samples_skipped}, "
        f"inserted {rows_inserted} rows for visit_id={config.visit_id}"
    )
    return dg.MaterializeResult(
        metadata={
            "samples_processed": samples_processed,
            "samples_skipped": samples_skipped,
            "rows_inserted": rows_inserted,
            "uri": config.uri,
        }
    )