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
# Specific approver pools per stage
QC_APPROVERS = [
    'qc.manager.jones', 'qc.supervisor.chen', 'qc.analyst.park', 'qc.admin.rodriguez'
]
BBA_APPROVERS = [
    'bba.supervisor.chen', 'bba.manager.jones', 'bba.coordinator.thompson'
]
PPC_APPROVERS = [
    'ppc.director.lee', 'ppc.supervisor.chen', 'ppc.manager.jones'
]
BOOKER_APPROVERS = [
    'booker.director.lee', 'booker.kim', 'booker.hernandez'
]

def choose_approver_for_status(status: str) -> str:
    """Return an approver userid appropriate for the given workflow status."""
    # combined fallback pool
    fallback_pool = QC_APPROVERS + BBA_APPROVERS + PPC_APPROVERS + BOOKER_APPROVERS
    if not status:
        return random.choice(fallback_pool)
    s = status.lower()
    if 'qc' in s:
        return random.choice(QC_APPROVERS)
    if 'bba' in s:
        return random.choice(BBA_APPROVERS)
    if 'ppc' in s:
        return random.choice(PPC_APPROVERS)
    if 'booker' in s:
        return random.choice(BOOKER_APPROVERS)
    # fallback
    return random.choice(fallback_pool)
STATUSES = [
    'For QC Approval', 'For BBA Approval', 'For PPC Approval',
    'For Booker Approval', 'Disapproved, For Resubmission',
    'Completed'
]

# WOAF approval flow
WORKFLOW_FLOW = ['For QC Approval', 'For BBA Approval', 'For PPC Approval', 'For Booker Approval', 'Completed']


def fetch_random_existing_transaction(conn):
    """Fetch a random existing transaction (transactionNumber, requestor, currentFormStatus).

    Returns a dict or None if none found.
    """
    try:
        cur = conn.cursor()
        # ORDER BY NEWID() randomizes rows in SQL Server
        # Also fetch submittedDate so new history rows can reuse it
        cur.execute("SELECT TOP 1 transactionNumber, requestor, submittedDate, currentFormStatus FROM sp_woaf WHERE transactionNumber IS NOT NULL ORDER BY NEWID()")
        row = cur.fetchone()
        cur.close()
        if row:
            # submittedDate may be a datetime; convert to string if needed
            submitted = row[2]
            if hasattr(submitted, 'strftime'):
                submitted = submitted.strftime('%Y-%m-%d %H:%M:%S')
            return {'TransactionNumber': row[0], 'Requestor': row[1], 'SubmittedDate': submitted, 'CurrentFormStatus': row[3]}
        return None
    except Exception as e:
        print('Could not fetch an existing transaction:', e)
        try:
            if 'cur' in locals():
                cur.close()
        except Exception:
            pass
        return None


def next_status_after(current_status: str) -> str:
    """Given a current status, decide the next status in the workflow or a disapproval/resubmission.

    Behavior:
    - Normally advance to the next stage in WORKFLOW_FLOW
    - With some probability, a stage can become 'Disapproved, For Resubmission'
    - If current status is 'Disapproved, For Resubmission', next is 'For QC Approval' (resubmission)
    """
    if not current_status:
        return 'For QC Approval'

    low = 0.15  # probability of disapproval at any non-final stage

    # If currently disapproved, simulate resubmission back to QC
    if current_status.lower().startswith('disapproved'):
        return 'For QC Approval'

    # If completed, no next step; keep as completed
    if current_status.lower() == 'completed' or current_status == 'Completed':
        return 'Completed'

    # Find index in workflow
    try:
        idx = WORKFLOW_FLOW.index(current_status)
    except ValueError:
        # unknown status: start from QC
        idx = 0

    # If we're at the last stage, stay completed
    if idx >= len(WORKFLOW_FLOW) - 1:
        return 'Completed'

    # Decide if disapproved
    if random.random() < low:
        return 'Disapproved, For Resubmission'

    # Otherwise advance to next stage
    return WORKFLOW_FLOW[idx + 1]


def make_transaction_number(prefix='WOAF') -> str:
    now = datetime.now()
    # Format: WOAFYYYY-MM-DD-HHMMSS (e.g. WOAF2026-03-20-081523)
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
        print('Failed to connect to database:')
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
                            last_modified_date: str,
                            dry_run: bool = False) -> bool:
    """Call stored procedure InsertTestData_WOAF with provided params.

    Assumptions:
    - Stored procedure `InsertTestData_WOAF` exists and accepts parameters used below.
    - If your proc has different parameter names/order, adjust the SQL string.
    """
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

    if dry_run:
        print('\n[DRY RUN] Would execute:')
        print('SQL:', sql)
        print('Params:', params)
        return True

    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        conn.commit()
        print(f"✓ Inserted: {transaction_number} | {requestor} | {current_status}")
        return True
    except Exception as e:
        print('Insert failed:')
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
    status = random.choice(STATUSES)
    approver = choose_approver_for_status(status)

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


def run_loop(mode: str, count: Optional[int], delay_seconds: Optional[int], dry_run: bool = False):
    conn = None
    if not dry_run:
        conn = create_connection()
        if conn is None:
            print('Aborting: cannot connect to database.')
            return

    inserted = 0
    try:
        while True:
            # Decide whether to create a new transaction or update an existing one
            # New transaction probability
            create_new_prob = 0.6
            if random.random() < create_new_prob:
                # Create a new transaction starting at QC
                record = generate_sample_record()
                # Ensure transaction number is generated at insertion time with requested format
                txn_number = make_transaction_number('WOAF')
                record['TransactionNumber'] = txn_number
                record['CurrentFormStatus'] = 'For QC Approval'
                # assign the QC approver for initial action
                record['CurrentApproverPIC'] = choose_approver_for_status('For QC Approval')
                record['ResubmittedDate'] = None
                record['CompletedDate'] = None
                record['LastModifiedBy'] = record['Requestor']
                record['LastModifiedDate'] = record['SubmittedDate']
                print(f"Creating NEW transaction {txn_number} (QC)")
            else:
                # Pick an existing transaction and advance its status
                existing = fetch_random_existing_transaction(conn)
                if existing:
                    txn_number = existing['TransactionNumber']
                    cur_status = existing['CurrentFormStatus'] or 'For QC Approval'
                    new_status = next_status_after(cur_status)
                    print(f"Updating existing {txn_number}: {cur_status} -> {new_status}")

                    # Build a record that simulates the update
                    # When reusing an existing transactionNumber, do NOT modify the original
                    # requestor or submittedDate — insert a new history row that preserves
                    # those fields but changes approver, status and last modified info.
                    # Approver who performed the action is the approver for the current status
                    approver_prev = choose_approver_for_status(cur_status)
                    # Approver for the next stage (who will receive the txn) is based on new_status
                    approver_next = choose_approver_for_status(new_status)

                    record = {
                        'TransactionNumber': txn_number,
                        'Requestor': existing.get('Requestor') or random.choice(REQUESTORS),
                        'SubmittedDate': existing.get('SubmittedDate') or random_timestamp(60),
                        'CurrentApproverPIC': approver_next,
                        'CurrentFormStatus': new_status,
                        'ResubmittedDate': None,
                        'CompletedDate': None,
                        'LastModifiedBy': approver_prev,
                        'LastModifiedDate': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }

                    if new_status == 'Disapproved, For Resubmission':
                        # Disapproval recorded by approver_prev, resubmitted date scheduled
                        record['ResubmittedDate'] = (datetime.now() + timedelta(days=random.randint(1,5))).strftime('%Y-%m-%d %H:%M:%S')
                        record['LastModifiedBy'] = approver_prev
                    if new_status == 'Completed':
                        # Completion recorded by approver_prev
                        record['CompletedDate'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                else:
                    # No existing transaction found; create new instead
                    record = generate_sample_record()
                    record['CurrentFormStatus'] = 'For QC Approval'
                    txn_number = record['TransactionNumber']
                    print('No existing txn to update; creating new txn', txn_number)

            # Insert (or append history) by calling the stored procedure
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
                record['LastModifiedDate'],
                dry_run=dry_run
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
            if conn:
                conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Insert random test transactions into SQL Server (InsertTestData_WOAF).')
    parser.add_argument('--mode', choices=['once', 'minute', 'hourly', 'daily'], default='once', help='When to insert records')
    parser.add_argument('--count', type=int, default=1, help='How many records to insert (total). If omitted, will run indefinitely for periodic modes.')
    parser.add_argument('--delay', type=int, default=None, help='Override sleep delay in seconds for periodic modes (useful for testing).')
    parser.add_argument('--dry-run', action='store_true', help='Print SQL and params without executing inserts')

    args = parser.parse_args()

    print(f"Mode: {args.mode} | Count: {args.count} | Delay override: {args.delay} | dry_run: {args.dry_run}")
    run_loop(args.mode, args.count, args.delay, dry_run=args.dry_run)
