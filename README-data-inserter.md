Data Inserter for SCM Monitoring System

This small script generates and inserts test transactions into your SQL Server database by calling the stored procedure `InsertTestData_WOAF`.

Files added:
- `data_inserter.py` - main script to generate and insert test data
- `requirements.txt` - lists Python dependency `pyodbc`

Quick start
1. Install dependencies (use your Python environment):

```powershell
pip install -r requirements.txt
```

2. Make sure your SQL Server is running and the ODBC driver referenced in `data_inserter.py` is installed (ODBC Driver 17 for SQL Server is typical on Windows).

3. Edit `data_inserter.py` if your `SERVER_NAME`, `DATABASE_NAME`, or ODBC `DRIVER` differs from the defaults.

4. Run once (insert 1 record):

```powershell
python data_inserter.py --mode once --count 1
```

5. Insert every minute (for testing, you can override delay):

```powershell
# insert 5 records, sleeping 5 seconds between each -- good for quick tests
python data_inserter.py --mode minute --count 5 --delay 5

# run continuously inserting one record per minute
python data_inserter.py --mode minute
```

Notes and assumptions
- The script calls the stored procedure `InsertTestData_WOAF` using the parameter list shown in the project samples. If your stored procedure has a different name or signature, update the `sql` string in `insert_test_transaction()` accordingly.
- Uses Windows Authentication (`Trusted_Connection=yes`). If you require SQL auth (username/password), modify the `conn_str` in `create_connection()`.
- The script prints success/failure messages to the console. For production use, consider adding logging and more robust error handling.
