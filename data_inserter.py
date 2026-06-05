import pyodbc
import random
import time
import argparse
from datetime import datetime, timedelta
from typing import Optional

# Uses the same connection pattern as your db_connection.py
SERVER_NAME = 'GREY-A1N8E2J1\\SQLEXPRESS'
DATABASE_NAME = 'SP_TRANSACTIONS'
DRIVER = 'ODBC Driver 17 for SQL Server'  # change if you need a different driver

# Example pick lists for generating realistic test data
REQUESTORS = [
    'john.smith', 'maria.garcia', 'robert.johnson', 'sarah.williams',
    'david.brown', 'emily.davis', 'michael.wilson', 'jessica.martinez',
    'christopher.taylor', 'amanda.anderson', 'daniel.thomas', 'laura.jackson',
    'javer.valino','marcielo.abalos','markciril.jamon', 'luisfrancis.liporada'
    , 'joy.balsomo'
]
APPROVERS = [
    'qc.manager.jones', 'bba.supervisor.chen', 'ppc.director.lee',
    'booker.director.lee', 'ppc.supervisor.chen', 'bba.manager.jones',
    'qc.supervisor.chen', 'booker.kim', 'qc.analyst.park', 'booker.hernandez'
]
STATUSES = [
    'For QC Approval', 'For BBA Approval', 'For PPC Approval',
    'For Booker Approval', 'Disapproved, For Resubmission', 'For Booker Approval',
    'For PPC Approval', 'Completed'
]


def make_transaction_number(prefix='WOAF') -> str:
    now = datetime.now()
    return f"{prefix}{now.strftime('%Y-%m-%d-%H%M%S')}"


def random_timestamp(within_days=7) -> str:
    """Return an ISO-like string for a random time within the last `within_days`."""
    now = datetime.now()
    delta = timedelta(days=random.uniform(0, within_days),
                      hours=random.uniform(0, 24),
                      minutes=random.uniform(0, 60),
                      seconds=random.uniform(0, 60))
    t = now - delta
    return t.strftime('%Y-%m-%d %H:%M:%S')


def create_connection():
    conn_str = (
        f"DRIVER={{{DRIVER}}};"
        f"SERVER={SERVER_NAME};"
        f"DATABASE={DATABASE_NAME};"
        "Trusted_Connection=yes;"
    )
    try:
        conn = pyodbc.connect(conn_str, autocommit=False)
        return conn
    except Exception as e:
        print('❌ Failed to connect to database:')
        print(e)
        return None


def insert_test_transaction(conn: pyodbc.Connection,
                            transaction_number: str,
                            requestor: str,
                            submitted_date: str,
                            current_approver: str,
                            current_status: str,
                            resubmitted_date: Optional[str],
                            completed_date: Optional[str],
                            last_modified_by: str,
                            last_modified_date: str) -> bool:
    """Call stored procedure InsertTestData_WOAF with provided params.

    Assumptions:
    - Stored procedure `InsertTestData_WOAF` exists and accepts parameters used below.
    - If your proc has different parameter names/order, adjust the SQL string.
    """
    cursor = conn.cursor()
    try:
        sql = (
            "EXEC InsertTestData_WOAF "
            "@TransactionNumber = ?, @Requestor = ?, @SubmittedDate = ?, "
            "@CurrentApproverPIC = ?, @CurrentFormStatus = ?, @ResubmittedDate = ?, "
            "@CompletedDate = ?, @LastModifiedBy = ?, @LastModifiedDate = ?"
        )
        params = (
            transaction_number,
            requestor,
            submitted_date,
            current_approver,
            current_status,
            resubmitted_date,
            completed_date,
            last_modified_by,
            last_modified_date
        )
        cursor.execute(sql, params)
        conn.commit()
        print(f"✓ Inserted: {transaction_number} | {requestor} | {current_status}")
        return True
    except Exception as e:
        print('❌ Insert failed:')
        print(e)
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        cursor.close()


def generate_sample_record() -> dict:
    txn_no = make_transaction_number('WOAF')
    requestor = random.choice(REQUESTORS)
    submitted = random_timestamp(30)
    approver = random.choice(APPROVERS)
    status = random.choice(STATUSES)

    # Randomly include resubmitted or completed dates depending on status
    resub = None
    comp = None
    if 'Disapproved' in status:
        # resubmitted some days after submitted
        resub = (datetime.strptime(submitted, '%Y-%m-%d %H:%M:%S') + timedelta(days=random.randint(1,7))).strftime('%Y-%m-%d %H:%M:%S')
    if status == 'Completed' or 'Completed' in status:
        comp = (datetime.strptime(submitted, '%Y-%m-%d %H:%M:%S') + timedelta(days=random.randint(1,10))).strftime('%Y-%m-%d %H:%M:%S')

    lm_by = requestor
    lm_date = submitted

    return {
        'TransactionNumber': txn_no,
        'Requestor': requestor,
        'SubmittedDate': submitted,
        'CurrentApproverPIC': approver,
        'CurrentFormStatus': status,
        'ResubmittedDate': resub,
        'CompletedDate': comp,
        'LastModifiedBy': lm_by,
        'LastModifiedDate': lm_date
    }


def run_loop(mode: str, count: Optional[int], delay_seconds: Optional[int]):
    conn = create_connection()
    if conn is None:
        print('Aborting: cannot connect to database.')
        return

    inserted = 0
    try:
        while True:
            record = generate_sample_record()
            insert_test_transaction(
                conn,
                record['TransactionNumber'],
                record['Requestor'],
                record['SubmittedDate'],
                record['CurrentApproverPIC'],
                record['CurrentFormStatus'],
                record['ResubmittedDate'],
                record['CompletedDate'],
                record['LastModifiedBy'],
                record['LastModifiedDate']
            )
            inserted += 1

            if count is not None and inserted >= count:
                print(f'Done: inserted {inserted} records as requested.')
                break

            if mode == 'once':
                break
            elif mode == 'minute':
                time.sleep(delay_seconds or 60)
            elif mode == 'hourly':
                time.sleep(delay_seconds or 3600)
            elif mode == 'daily':
                time.sleep(delay_seconds or 86400)
            else:
                # default to one-off
                break
    except KeyboardInterrupt:
        print('\nInterrupted by user. Stopping.')
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Insert random test transactions into SQL Server (InsertTestData_WOAF).')
    parser.add_argument('--mode', choices=['once', 'minute', 'hourly', 'daily'], default='once', help='When to insert records')
    parser.add_argument('--count', type=int, default=1, help='How many records to insert (total). If omitted, will run indefinitely for periodic modes.')
    parser.add_argument('--delay', type=int, default=None, help='Override sleep delay in seconds for periodic modes (useful for testing).')

    args = parser.parse_args()

    print(f"Mode: {args.mode} | Count: {args.count} | Delay override: {args.delay}")
    run_loop(args.mode, args.count, args.delay)
