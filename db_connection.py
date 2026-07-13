import pyodbc as odbc
import os
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration from environment variables (best practice: never hardcode credentials)
SERVER_NAME = os.getenv('SERVER_NAME')
DATABASE_NAME = os.getenv('DATABASE_NAME')
DB_DRIVER = os.getenv('DB_DRIVER')
DB_TIMEOUT = int(os.getenv('DB_TIMEOUT'))

# Connection pool settings
_connection_string = None


def _get_connection_string():
    """Build and cache the connection string."""
    global _connection_string
    if _connection_string is None:
        _connection_string = (
            f"DRIVER={{{DB_DRIVER}}};"
            f"SERVER={SERVER_NAME};"
            f"DATABASE={DATABASE_NAME};"
            f"Trusted_Connection=yes;"
            f"Connection Timeout={DB_TIMEOUT};"
        )
    return _connection_string


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Ensures connections are properly opened and closed, preventing connection leaks.

    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM table")
            data = cursor.fetchall()
    """
    conn = None
    try:
        conn = odbc.connect(_get_connection_string())
        yield conn
    except odbc.Error as e:
        print(f"Database connection error: {e}")
        raise
    finally:
        if conn:
            conn.close()


def get_transactions():
    """
    Get all transactions from the database view and return as list of dictionaries.
    Uses context manager to ensure proper connection cleanup.

    Returns:
        list[dict]: List of transaction dictionaries, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Select all columns from the view to ensure complete data
            cursor.execute("SELECT " \
            " [source] " \
            " ,[transactionNumber] " \
            " ,[requestor] " \
            " ,[submittedDate] " \
            " ,[currentApproverPIC] " \
            " ,[currentFormStatus] " \
            " ,[resubmittedDate] " \
            " ,[completedDate] " \
            " ,[lastModifiedBy] " \
            " ,[lastModifiedDate] " \
            " ,[dashboardStatus] " \
            " FROM [all_transactions]")

            # Get column names from cursor description
            columns = [column[0] for column in cursor.description]

            # Convert rows to list of dictionaries
            transactions = []
            for row in cursor.fetchall():
                transaction = {}
                for i, value in enumerate(row):
                    # Convert datetime to ISO format string if needed
                    if hasattr(value, 'strftime'):
                        transaction[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        transaction[columns[i]] = str(value) if value is not None else ""
                transactions.append(transaction)

            cursor.close()
            return transactions

    except odbc.Error as e:
        print(f"Database query error: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_transactions: {e}")
        return []


def get_critical_transactions_count():
    """
    Get the count of critical transactions from the database.
    Uses context manager to ensure proper connection cleanup.

    Returns:
        int: Count of critical transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            query = """
                 SELECT 
                    CriticalCount 
                FROM critical_transactions_count_view
            """
            cursor.execute(query)
            
            row = cursor.fetchone()
            count = row.CriticalCount if row else 0
            
            cursor.close()
            return count
            
    except odbc.Error as e:
        print(f"Database query error in get_critical_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_critical_transactions_count: {e}")
        return 0

def get_warning_transactions_count():
    """
    Get the count of warning transactions from the database.
    Uses context manager to ensure proper connection cleanup.

    Returns:
        int: Count of warning transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            query = """
                 SELECT 
                    WarningCount 
                FROM warning_transactions_count_view
            """
            cursor.execute(query)
            
            row = cursor.fetchone()
            count = row.WarningCount if row else 0
            
            cursor.close()
            return count
            
    except odbc.Error as e:
        print(f"Database query error in get_warning_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_warning_transactions_count: {e}")
        return 0

def get_normal_transactions_count():
    """
    Get the count of normal transactions from the database.
    Uses context manager to ensure proper connection cleanup.

    Returns:
        int: Count of normal transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                  NormalCount 
                FROM normal_transactions_count_view
            """
            cursor.execute(query)

            row = cursor.fetchone()
            count = row.NormalCount if row else 0

            cursor.close()
            return count

    except odbc.Error as e:
        print(f"Database query error in get_normal_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_normal_transactions_count: {e}")
        return 0

def get_forApproval_transactions_count():
    """
    Get the count of 'For Approval' transactions from the database.

    A transaction is considered 'For Approval' when it has been newly submitted
    or just approved by the previous approver — meaning its last modified date
    is today. These are fresh transactions that are immediately ready for the
    next approver's action.

    Returns:
        int: Count of for-approval transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                    ForApprovalTransactionCount 
                FROM ForApproval_transactions_count_view
            """
            cursor.execute(query)

            row = cursor.fetchone()
            # ✅ Add these debug lines temporarily
            print(f"Row returned: {row}")
            print(f"Column names: {[col[0] for col in cursor.description]}")

            count = row.ForApprovalTransactionCount if row else 0
            print(f"ForApproval count: {count}")

            cursor.close()
            return count
            # count = row.ForApprovalCount if row else 0

            # cursor.close()
            # return count

    except odbc.Error as e:
        print(f"Database query error in get_forApproval_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_forApproval_transactions_count: {e}")
        return 0
    
def get_Pending_transactions_count():
    """
    Get the count of 'Pending' transactions from the database.

    A transaction is considered 'Pending' under either of these conditions:
    - More than 1 day has passed since the last modification date, meaning
      it has been sitting with the current approver without any action.
    - The transaction was disapproved and is waiting to be corrected
      and resubmitted by the requestor.

    Queries the Pending_transactions_count_view database view.

    Returns:
        int: Count of pending transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                    PendingTransactionCount  
                FROM Pending_transactions_count_view
            """
            cursor.execute(query)

            row = cursor.fetchone()
            count = row.PendingTransactionCount if row else 0

            cursor.close()
            return count

    except odbc.Error as e:
        print(f"Database query error in get_Pending_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_Pending_transactions_count: {e}")
        return 0
		
def get_ForAdditionalInput_transactions_count():
    """
    Get the count of 'ForAdditionalInput' transactions from the database.

    A transaction is considered 'For Additional Input' when it requires the
    current approver to provide supplementary details before it can proceed
    to the next stage. This applies to transactions currently at the following
    stages:
    - For PO Issuance
    - Request for Quotation
    - For VOP Processing
    - Payment Processing

    Queries the ForAdditionalInput_transactions_count_view database view.

    Returns:
        int: Count of ForAdditionalInput transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT
                    ForAdditionalInputCount
                FROM ForAdditionalInput_transactions_count_view
            """
            cursor.execute(query)

            row = cursor.fetchone()
            count = row.ForAdditionalInputCount if row else 0

            cursor.close()
            return count

    except odbc.Error as e:
        print(f"Database query error in get_ForAdditionalInput_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_ForAdditionalInput_transactions_count: {e}")
        return 0
		
def get_Complete_transactions_count():
    """
    Get the count of 'Complete' transactions from the database.

    A transaction is considered 'Complete' when all of the following
    conditions are met:
    - The form status is marked as Completed.
    - The current PIC (Person in Charge) approver field is blank,
      indicating no further approvals are required.
    - The completed date is not null, confirming the transaction
      has been formally closed.

    Queries the Completed_transactions_count_view database view.

    Returns:
        int: Count of Complete transactions, 0 on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                    TransactionCompletedCount 
                FROM Completed_transactions_count_view
            """
            cursor.execute(query)

            row = cursor.fetchone()
            count = row.TransactionCompletedCount if row else 0 #row.column from database

            cursor.close()
            return count

    except odbc.Error as e:
        print(f"Database query error in get_Complete_transactions_count: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_Complete_transactions_count: {e}")
        return 0
    
def get_all_transactions_list():
    """
    Get a list of all transactions from the database.

    Queries the All_transactions_list_view database view.

    Returns:
        list: List of all transactions, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                 SELECT 
                    [Transaction Type],
                    [Transaction Name], 
                    [Requestor],
                    [Submitted Date],
                    [Last Updated],
                    [Current Stage], 
                    [Current PIC], 
                    [Status], 
                    [Aging (Days)],
                    [SLA Status]
                FROM all_transactions_list 
                ORDER BY [Last Updated] DESC
                
                
            """
            # ORDER BY [Last Updated] DESC
            # ORDER BY [Status] DESC
            cursor.execute(query)

            # Get column names from cursor description
            columns = [col[0] for col in cursor.description]

            # Zip each row with column names to create proper dicts
            rows = cursor.fetchall()
            # result = [dict(zip(columns, row)) for row in rows] # commented 7/13
            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))

                # Format date columns to YYYY-MM-DD string
                for date_col in ['Submitted Date', 'Last Updated']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')

                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_all_transactions_list: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_all_transactions_list: {e}")
        return []

def get_SLA_InformationDetails():
    """
    Get Normal, Warning, and Critical SLA Information
    details of each transaction type from the database.

    Queries the SLA_InformationDetails

    Returns:
        string: SLA Information details.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                    [transactionType]
                    ,[Normal SLA]
                    ,[Warning SLA]
                    ,[Critical SLA]
                FROM [SLA_InformationDetails]
            """
            cursor.execute(query)

            row = cursor.fetchone()
            count = row.SLA_InformationDetails if row else 0 #row.column from database

            cursor.close()
            return count

    except odbc.Error as e:
        print(f"Database query error in get_SLA_InformationDetails: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_SLA_InformationDetails: {e}")
        return 0

def test_connection():
    """
    Test the database connection and return status info.
    Useful for health check endpoints.

    Returns:
        dict: Connection status with success flag and message.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            return {
                'success': True,
                'message': f'Connected to {SERVER_NAME}/{DATABASE_NAME}',
                'server': SERVER_NAME,
                'database': DATABASE_NAME
            }
    except odbc.Error as e:
        return {
            'success': False,
            'message': f'Connection failed: {str(e)}',
            'server': SERVER_NAME,
            'database': DATABASE_NAME
        }


if __name__ == "__main__":
    # Test the connection first
    status = test_connection()
    print(f"Connection test: {status['message']}")

    if status['success']:
        data = get_transactions()
        print(f"Found {len(data)} transactions")
        for transaction in data[:2]:  # Show first 2
            print(transaction)

