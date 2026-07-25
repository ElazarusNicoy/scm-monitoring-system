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

            columns = [col[0] for col in cursor.description]

            rows = cursor.fetchall()
            result = [dict(zip(columns, row)) for row in rows]

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_SLA_InformationDetails: {e}")
        return 0
    except Exception as e:
        print(f"Unexpected error in get_SLA_InformationDetails: {e}")
        return 0
    
def get_all_transactions_workflow_progress():
    """
    Get a list of all transactions's workflow progress from the database.

    Queries the all_transactions_workflow_progress database view.

    Returns:
        list: List of all transaction's workflow progress, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                 SELECT 
                    [Transaction Name]
                    ,[Requestor]
                    ,[Submitted Date]
                    ,[Current PIC]
                    ,[Current Stage]
                    ,[Resubmitted Date]
                    ,[Completed Date]
                    ,[Last Modified By]
                    ,[Last Modified Date]
                    ,[Workflow Progress]
                FROM all_transactions_workflow_progress
                ORDER BY [Last Modified Date] DESC
            """
            cursor.execute(query)

            columns = [col[0] for col in cursor.description]
            print(f"Columns returned: {columns}")

            rows = cursor.fetchall()
            print(f"Total rows fetched: {len(rows)}")          # ← check this
            print(f"Sample row: {rows[0] if rows else 'empty'}")  # ← check this

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['Submitted Date', 'Last Modified Date', 'Resubmitted Date', 'Completed Date']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_all_transactions_workflow_progress: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_all_transactions_workflow_progress: {e}")
        return []

def get_distinct_stages_from_all_transactions_list():
    """
    Get distinct stages from all transactions in the database.

    Queries the all_transactions_workflow_progress database view.

    Returns:
        list: List of distinct stages from all transactions, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                DISTINCT [Current Stage]
                FROM [all_transactions_list] 
                ORDER BY [Current Stage]
            """
            cursor.execute(query)

            rows = cursor.fetchall()
            result = [row[0] for row in rows if row[0] is not None]

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_distinct_stages_from_all_transactions_list: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_distinct_stages_from_all_transactions_list: {e}")
        return []

def get_distinct_transaction_types_from_all_transactions_list():
    """
    Get distinct transaction types from all transactions in the database
    Returns:
        list: List of distinct transaction types from all transactions, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                DISTINCT [Transaction Type]
                FROM [all_transactions_list] 
                ORDER BY [Transaction Type]
            """
            cursor.execute(query)

            rows = cursor.fetchall()
            result = [row[0] for row in rows if row[0] is not None]

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_distinct_transaction_types_from_all_transactions_list: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_distinct_transaction_types_from_all_transactions_list: {e}")
        return []

def get_distinct_current_pic_from_all_transactions_list():
    """
    Get distinct current PICs from all transactions in the database
    Returns:
        list: List of distinct current PICs from all transactions, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                DISTINCT [Current PIC]
                FROM [all_transactions_list] 
                WHERE [Current PIC] != ''
                ORDER BY [Current PIC]
            """
            cursor.execute(query)

            rows = cursor.fetchall()
            result = [row[0] for row in rows if row[0] is not None]

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_distinct_current_pic_from_all_transactions_list: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_distinct_current_pic_from_all_transactions_list: {e}")
        return []

def get_distinct_current_pic_from_warningCrit_transactions_list():
    """
    Get distinct current PICs from warning & Critical transactions in the database
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT 
                DISTINCT [Current PIC]
                FROM [all_transactions_list] 
                WHERE [Current PIC] != ''
                AND [SLA Status] IN ('Warning','Critical')
                ORDER BY [Current PIC]
            """
            cursor.execute(query)

            rows = cursor.fetchall()
            result = [row[0] for row in rows if row[0] is not None]

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_distinct_current_pic_from_warningCrit_transactions_list: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_distinct_current_pic_from_warningCrit_transactions_list: {e}")
        return []

def get_newly_warningCriticalTransactions():
    """
    Get newly warning and critical transactions
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT
                    atl.[Transaction Name],
                    atl.[Transaction Type],
                    atl.[Requestor],
                    atl.[Current Stage],
                    atl.[Current PIC],
                    atl.[Current PIC] + '@ionics-ems.com' AS [Current PIC Email],
                    atl.[Requestor] + '@ionics-ems.com' AS [Requestor Email],
                    atl.[Status],
                    atl.[Aging (Days)],
                    atl.[SLA Status],
                    atl.[Submitted Date],
                    atl.[Last Updated],
                    CASE 
                        WHEN atl.[Transaction Type] = 'MAS' THEN 'http://sharepoint/sites/hqservices/Movement%20Approval%20Sheet/'+atl.[Transaction Name]+'.xml'
                        WHEN atl.[Transaction Type] = 'RCP' THEN 'http://sharepoint/sites/hqservices/RCP/'+atl.[Transaction Name]+'.xml'
                        WHEN atl.[Transaction Type] = 'PR' THEN 'http://sharepoint/sites/hqservices/Purchase%20Requisition/'+atl.[Transaction Name]+'.xml'
                        WHEN atl.[Transaction Type] = 'POACR' THEN 'http://sharepoint/sites/hqservices/PO%20Amend%Cancel%Request/'+atl.[Transaction Name]+'.xml'
                        WHEN atl.[Transaction Type] = 'WOAF' THEN 'http://sharepoint/sites/hqservices/Work%20Order%20Amendment%20Form/'+atl.[Transaction Name]+'.xml'
                        ELSE 'N/A'
                    END AS [SharePoint Link]
                FROM dbo.all_transactions_list atl
                INNER JOIN dbo.SLA_Threshold sla
                    ON  sla.transactionType = atl.[Transaction Type]
                    AND sla.Active = 1
                    AND sla.thresholdStatus = atl.[SLA Status]
                WHERE
                    -- Transaction is exactly on the first day of Warning or Critical
                    CAST(atl.[Aging (Days)] AS INT) = CAST(sla.daysAgingValue AS INT)
                    AND atl.[SLA Status] IN ('Warning', 'Critical')
            """
            cursor.execute(query)

            columns = [col[0] for col in cursor.description]
            print(f"Newly aged transactions columns: {columns}")

            rows = cursor.fetchall()
            print(f"Total newly aged transactions: {len(rows)}")

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['Submitted Date', 'Last Updated']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_newly_warningCriticalTransactions: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_newly_warningCriticalTransactions: {e}")
        return []

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

def get_all_transactions_list_WarningCriticalAged():
    """
    Get a list of all transactions's warning and critically aged from the database.

    Queries the all_transactions_list database view.

    Returns:
        list: List of all transaction's warning and critically aged, empty list on error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                 SELECT 
					[Transaction Type],
					[Transaction Name],
					Requestor,
					[Submitted Date],
					[Last Updated],
					[Current Stage],
					[Current PIC],
					Status,
					[Aging (Days)],
					[SLA Status]
				FROM [all_transactions_list] 
				WHERE [SLA Status] IN ('Warning', 'Critical') 
				ORDER BY [Last Updated] DESC
            """
            cursor.execute(query)

            # Add these debug prints
            columns = [col[0] for col in cursor.description]
            print(f"Columns returned: {columns}")

            rows = cursor.fetchall()
            print(f"Total rows fetched: {len(rows)}")          # ← check this
            print(f"Sample row: {rows[0] if rows else 'empty'}")  # ← check this

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['Submitted Date', 'Last Updated']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_all_transactions_list_WarningCriticalAged: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_all_transactions_list_WarningCriticalAged: {e}")
        return []

def get_newly_warning_transactions():
    """
    Get the count of newly warning transactions from the database.

    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                 SELECT 
					transactionNumber, 
					requestor,  
					submittedDate,
					currentApproverPIC,
					currentFormStatus,
					lastModifiedDate,
					dashboardStatus,
					agingDays,
					thresholdStatus
				FROM [newlyWarningAgedTransactions]
				ORDER BY lastModifiedDate DESC
            """
            cursor.execute(query)

            # Add these debug prints
            columns = [col[0] for col in cursor.description]
            print(f"Columns returned: {columns}")

            rows = cursor.fetchall()
            print(f"Total rows fetched: {len(rows)}")          # ← check this
            print(f"Sample row: {rows[0] if rows else 'empty'}")  # ← check this

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['submittedDate', 'lastModifiedDate']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_newly_warning_transactions: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_newly_warning_transactions: {e}")
        return []
		
def get_newly_critical_transactions():
    """
    Get the count of newly critical transactions from the database.

    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                 SELECT 
					transactionNumber, 
					requestor,  
					submittedDate,
					currentApproverPIC,
					currentFormStatus,
					lastModifiedDate,
					dashboardStatus,
					agingDays,
					thresholdStatus
				FROM [newlyCriticalAgedTransactions]
				ORDER BY lastModifiedDate DESC
            """
            cursor.execute(query)

            # Add these debug prints
            columns = [col[0] for col in cursor.description]
            print(f"Columns returned: {columns}")

            rows = cursor.fetchall()
            print(f"Total rows fetched: {len(rows)}")          # ← check this
            print(f"Sample row: {rows[0] if rows else 'empty'}")  # ← check this

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['submittedDate', 'lastModifiedDate']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_newly_critical_transactions: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_newly_critical_transactions: {e}")
        return []



# ...existing code...

def get_escalation_transactions():
    """Get all Warning and Critical transactions only — excludes Normal and Completed."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    [Transaction Name],      
                    [Transaction Type],      
                    [Requestor],             
                    [Current Stage],         
                    [Current PIC],           
                    [Current PIC] + '@ionics-ems.com' AS [Current PIC Email],
                    [Requestor] + '@ionics-ems.com' AS [Requestor Email],
                    [Status],
                    [Aging (Days)],
                    [SLA Status],
                    [Submitted Date],
                    [Last Updated],
                    CASE 
                        WHEN [Transaction Type] = 'MAS' THEN 'http://sharepoint/sites/hqservices/Movement%20Approval%20Sheet/'+[Transaction Name]+'.xml'
                        WHEN [Transaction Type] = 'RCP' THEN 'http://sharepoint/sites/hqservices/RCP/'+[Transaction Name]+'.xml'
                        WHEN [Transaction Type] = 'PR' THEN 'http://sharepoint/sites/hqservices/Purchase%20Requisition/'+[Transaction Name]+'.xml'
                        WHEN [Transaction Type] = 'POACR' THEN 'http://sharepoint/sites/hqservices/PO%20Amend%Cancel%Request/'+[Transaction Name]+'.xml'
                        WHEN [Transaction Type] = 'WOAF' THEN 'http://sharepoint/sites/hqservices/Work%20Order%20Amendment%20Form/'+[Transaction Name]+'.xml'
                        ELSE 'N/A'
                    END AS [SharePoint Link]
                FROM dbo.all_transactions_list
                WHERE [SLA Status] IN ('Warning', 'Critical')
                ORDER BY [Aging (Days)] DESC
            """)

            columns = [col[0] for col in cursor.description]
            print(f"Columns returned: {columns}")

            rows = cursor.fetchall()
            print(f"Total rows fetched: {len(rows)}")
            print(f"Sample row: {rows[0] if rows else 'empty'}")

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for date_col in ['Submitted Date', 'Last Updated']:
                    if date_col in row_dict and row_dict[date_col] is not None:
                        row_dict[date_col] = row_dict[date_col].strftime('%Y-%m-%d')
                result.append(row_dict)

            cursor.close()
            return result

    except odbc.Error as e:
        print(f"Database query error in get_escalation_transactions: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error in get_escalation_transactions: {e}")
        return []

# ...existing code...


def get_transactions_newly_aged():
    """
    Retrieve transactions that are on their FIRST DAY as Warning or Critical.
    Compares aging days against SLA threshold daysAgingValue exactly.
    These are candidates for automated email dispatch.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
				atl.[Transaction Name],
				atl.[Transaction Type],
				atl.[Requestor],
				atl.[Current Stage],
				atl.[Current PIC],
				atl.[Current PIC] + '@ionics-ems.com' AS [Current PIC Email],
				atl.[Requestor] + '@ionics-ems.com' AS [Requestor Email],
				atl.[Status],
				atl.[Aging (Days)],
				atl.[SLA Status],
				CASE 
					WHEN [Transaction Type] = 'MAS' THEN 'http://sharepoint/sites/hqservices/Movement%20Approval%20Sheet/'+[Transaction Name]+'.xml'
					WHEN [Transaction Type] = 'RCP' THEN 'http://sharepoint/sites/hqservices/RCP/'+[Transaction Name]+'.xml'
					WHEN [Transaction Type] = 'PR' THEN 'http://sharepoint/sites/hqservices/Purchase%20Requisition/'+[Transaction Name]+'.xml'
					WHEN [Transaction Type] = 'POACR' THEN 'http://sharepoint/sites/hqservices/PO%20Amend%Cancel%Request/'+[Transaction Name]+'.xml'
					WHEN [Transaction Type] = 'WOAF' THEN 'http://sharepoint/sites/hqservices/Work%20Order%20Amendment%20Form/'+[Transaction Name]+'.xml'
					ELSE 'N/A'
				END AS [SharePoint Link],
				sla.daysAgingValue
			FROM dbo.all_transactions_list atl
			INNER JOIN dbo.SLA_Threshold sla
				ON  sla.transactionType = atl.[Transaction Type]
				AND sla.Active = 1
				AND sla.thresholdStatus = atl.[SLA Status]
			WHERE
				-- Transaction is exactly on the first day of Warning or Critical
				CAST(atl.[Aging (Days)] AS INT) = CAST(sla.daysAgingValue AS INT)
				AND atl.[SLA Status] IN ('Warning', 'Critical')
				-- Not yet sent as auto email for this escalation type
				AND NOT EXISTS (
					SELECT 1 FROM dbo.EscalationLog el
					WHERE el.transactionNumber = atl.[Transaction Name]
					  AND el.escalationType    = LOWER(atl.[SLA Status])
					  AND el.sentType          = 'auto'
				)
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def log_escalation_email(transaction_number, transaction_type,
                          escalation_type, email_to, email_cc, sent_type, sent_by='SYSTEM'):
    """Log a sent escalation email to EscalationLog table."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO dbo.EscalationLog
                (transactionNumber, transactionType, escalationType,
                 emailSentTo, emailCC, sentType, sentBy)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (transaction_number, transaction_type, escalation_type,
              email_to, email_cc, sent_type, sent_by))
        conn.commit()


def get_escalation_log():
    """Get all escalation email logs ordered by most recent."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                id,
                transactionNumber,
                transactionType,
                escalationType,
                emailSentTo,
                emailCC,
                sentType,
                sentBy,
                CONVERT(VARCHAR, sentAt, 120) AS sentAt
            FROM dbo.EscalationLog
            ORDER BY sentAt DESC
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


if __name__ == "__main__":
    # Test the connection first
    status = test_connection()
    print(f"Connection test: {status['message']}")

    if status['success']:
        data = get_all_transactions_list()
        print(f"Found {len(data)} transactions")
        for transaction in data[:2]:  # Show first 2
            print(transaction)

