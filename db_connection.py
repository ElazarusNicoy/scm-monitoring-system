import pyodbc as odbc

SERVER_NAME = 'GREY-A1N8E2J1\\SQLEXPRESS'  # Try adding instance name
DATABASE_NAME = 'SP_TRANSACTIONS'

def connect_to_sql_server():
    try:
        connection_string = f"""
            DRIVER={{ODBC Driver 17 for SQL Server}};
            SERVER={SERVER_NAME};
            Trusted_Connection=yes;
        """
        
        conn = odbc.connect(connection_string)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sys.databases")
        databases = cursor.fetchall()
        
        print("Available databases:")
        for db in databases:
            print(f"- {db[0]}")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Basic connection failed: {e}")

if __name__ == "__main__":
    connect_to_sql_server()