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
            cursor.execute("SELECT * FROM [all_transactions]")

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
            (
                SELECT COUNT(*)
                FROM mas_transactions_with_threshold
                WHERE thresholdStatus = 'Critical'
            )
            +
            (
                SELECT COUNT(*)
                FROM rcp_transactions_with_threshold
                WHERE thresholdStatus = 'Critical'
            )
            +
            (
                SELECT COUNT(*)
                FROM poacr_transactions_with_threshold
                WHERE thresholdStatus = 'Critical'
            )
            +
            (
                SELECT COUNT(*)
                FROM pr_transactions_with_threshold
                WHERE thresholdStatus = 'Critical'
            )
            +
            (
                SELECT COUNT(*)
                FROM woaf_transactions_with_threshold
                WHERE thresholdStatus = 'Critical'
            )
            AS CriticalCount;
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
            (
                SELECT COUNT(*)
                FROM mas_transactions_with_threshold
                WHERE thresholdStatus = 'Warning'
            )
            +
            (
                SELECT COUNT(*)
                FROM rcp_transactions_with_threshold
                WHERE thresholdStatus = 'Warning'
            )
            +
            (
                SELECT COUNT(*)
                FROM poacr_transactions_with_threshold
                WHERE thresholdStatus = 'Warning'
            )
            +
            (
                SELECT COUNT(*)
                FROM pr_transactions_with_threshold
                WHERE thresholdStatus = 'Warning'
            )
            +
            (
                SELECT COUNT(*)
                FROM woaf_transactions_with_threshold
                WHERE thresholdStatus = 'Warning'
            )
            AS WarningCount;
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
            (
                SELECT COUNT(*)
                FROM mas_transactions_with_threshold
                WHERE thresholdStatus = 'Normal'
            )
            +
            (
                SELECT COUNT(*)
                FROM rcp_transactions_with_threshold
                WHERE thresholdStatus = 'Normal'
            )
            +
            (
                SELECT COUNT(*)
                FROM poacr_transactions_with_threshold
                WHERE thresholdStatus = 'Normal'
            )
            +
            (
                SELECT COUNT(*)
                FROM pr_transactions_with_threshold
                WHERE thresholdStatus = 'Normal'
            )
            +
            (
                SELECT COUNT(*)
                FROM woaf_transactions_with_threshold
                WHERE thresholdStatus = 'Normal'
            )
            AS NormalCount;
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

