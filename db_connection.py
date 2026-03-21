import pyodbc as odbc
import json

SERVER_NAME = 'GREY-A1N8E2J1\\SQLEXPRESS'  # Try adding instance name
DATABASE_NAME = 'SP_TRANSACTIONS'

# def connect_to_sql_server():
#     try:
#         connection_string = f"""
#             DRIVER={{ODBC Driver 17 for SQL Server}};
#             SERVER={SERVER_NAME};
#             Trusted_Connection=yes;
#         """
        
#         conn = odbc.connect(connection_string)
#         cursor = conn.cursor()
#         cursor.execute("SELECT source, transactionNumber, requestor, " \
#         "submittedDate, currentApproverPIC, currentFormStatus, resubmittedDate," \
#         "completedDate, lastModifiedBy, lastModifiedDate " \
#         "FROM [SP_TRANSACTIONS].[dbo].[all_transactions]")
#         data = cursor.fetchall()
#         for row in data:
#             print(row)
            
#         cursor.close()
#         conn.close()
        
#     except Exception as e:
#         print(f"Basic connection failed: {e}")

# def get_transactions():


# if __name__ == "__main__":
#     connect_to_sql_server()

def get_transactions():
    """Get all transactions from database and return as list of dictionaries"""
    try:
        connection_string = f"""
            DRIVER={{ODBC Driver 17 for SQL Server}};
            SERVER={SERVER_NAME};
            DATABASE={DATABASE_NAME};
            Trusted_Connection=yes;
        """
        
        conn = odbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Fixed SQL query with proper comma
        cursor.execute("""
            SELECT source, transactionNumber, requestor, 
                   submittedDate, currentApproverPIC, currentFormStatus, 
                   resubmittedDate, completedDate, lastModifiedBy, lastModifiedDate 
            FROM all_transactions
        """)
        
        # Get column names
        columns = [column[0] for column in cursor.description]
        
        # Convert rows to list of dictionaries
        transactions = []
        for row in cursor.fetchall():
            transaction = {}
            for i, value in enumerate(row):
                # Convert datetime to string if needed
                if hasattr(value, 'strftime'):
                    transaction[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    transaction[columns[i]] = str(value) if value else ""
            transactions.append(transaction)
            
        cursor.close()
        conn.close()
        
        return transactions
        
    except Exception as e:
        print(f"Database error: {e}")
        return []

if __name__ == "__main__":
    # Test the function
    data = get_transactions()
    print(f"Found {len(data)} transactions")
    for transaction in data[:2]:  # Show first 2
        print(transaction)