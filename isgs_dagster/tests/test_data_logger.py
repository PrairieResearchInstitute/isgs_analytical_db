from datetime import datetime

from isgs_dagster.defs.data_logger import detect_format, parse_diver_rows, parse_ins_rows

DIVER_SNIPPET = """\
Data file for DataLogger.
==============================================================================
COMPANY    : <Company name>
DATE       : 02/10/2024
[Logger settings]
  Location  =DIVER_49_5L_GW
[Channel 1]
  Identification =WATER HEAD (WC)
[Channel 2]
  Identification =TEMPERATURE


Date/time,Water head[cm],Temperature[C]
2021/07/22 12:00:00,     ,12.790
2021/07/22 15:00:00,452.1,12.807
2021/07/22 18:00:00,     ,
"""

INS_SNIPPET = """\
"Location Properties"
"Location Name = INS_049_SW43_SW"
"Latitude = 41.35 °"
"Longitude = -88.39 °"


""
"Date Time","Pressure (psi)","Temperature (C)","Depth (m)"
"2024-04-20 10:00:00.000","0.596","12.248","0.419"
"2024-04-20 11:00:00.000","0.594","11.896","0.418"
"""


def test_detect_format_diver():
    assert detect_format(DIVER_SNIPPET) == "diver"


def test_detect_format_ins():
    assert detect_format(INS_SNIPPET) == "ins"


def test_detect_format_diver_with_crlf():
    crlf = DIVER_SNIPPET.replace("\n", "\r\n")
    assert detect_format(crlf) == "diver"


def test_parse_diver_rows_basic():
    rows = parse_diver_rows(DIVER_SNIPPET, station_visit_id=7)
    # row with blank temp is skipped; the other two have values
    assert len(rows) == 2
    assert rows[0] == (7, datetime(2021, 7, 22, 12, 0, 0), 12.790)
    assert rows[1] == (7, datetime(2021, 7, 22, 15, 0, 0), 12.807)


def test_parse_diver_rows_skips_blank_temperature():
    rows = parse_diver_rows(DIVER_SNIPPET, station_visit_id=1)
    timestamps = [r[1] for r in rows]
    # 18:00 row has blank temperature — must not appear
    assert datetime(2021, 7, 22, 18, 0, 0) not in timestamps


def test_parse_diver_rows_station_visit_id_propagated():
    rows = parse_diver_rows(DIVER_SNIPPET, station_visit_id=42)
    assert all(r[0] == 42 for r in rows)


def test_parse_ins_rows_basic():
    rows = parse_ins_rows(INS_SNIPPET, station_visit_id=3)
    assert len(rows) == 2
    assert rows[0] == (3, 0.596, 12.248, 0.419)
    assert rows[1] == (3, 0.594, 11.896, 0.418)


def test_parse_ins_rows_station_visit_id_propagated():
    rows = parse_ins_rows(INS_SNIPPET, station_visit_id=99)
    assert all(r[0] == 99 for r in rows)