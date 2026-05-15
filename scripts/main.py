# This is a sample Python script.

# Press ⌃R to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.

import pyodbc

def print_hi(name):
    conn_str = (
        "Driver={MDBTools};"
        "DBQ=IDOT.accdb"
    )

    conn = pyodbc.connect(conn_str)
    print(conn)


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
