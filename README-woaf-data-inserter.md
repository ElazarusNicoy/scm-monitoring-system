# WOAF Data Inserter

This script (`woaf_data_inserter.py`) simulates WOAF transactions and inserts them into the `sp_woaf` table by calling the stored procedure `InsertTestData_WOAF`.

Files
- `woaf_data_inserter.py` — main script to generate and insert WOAF test data
- `requirements.txt` — Python dependency list (pyodbc)

Prerequisites
- Python 3.8+
- `pyodbc` installed (see below)
- ODBC Driver for SQL Server (ODBC Driver 17 for SQL Server is common on Windows)
- SQL Server instance accessible and the `sp_woaf` table and stored procedure `InsertTestData_WOAF` available

Install dependencies
```powershell
pip install -r requirements.txt
```

Usage overview
The script accepts these flags:
- `--mode` : `once` | `minute` | `hourly` | `daily` (default: `once`)
- `--count` : number of records to insert (default: `1`). If omitted for periodic modes the script runs until stopped.
- `--delay` : override the sleep delay in seconds for periodic modes (useful for testing)
- `--dry-run` : print the SQL and parameters that would be executed without touching the database

Behavior by mode
- `once` — Insert the specified `--count` records immediately and exit.
- `minute` — Insert records at ~1-minute intervals (60s) unless `--delay` overrides it.
- `hourly` — Insert records at ~1-hour intervals (3600s) unless `--delay` overrides it.
- `daily` — Insert records at ~24-hour intervals (86400s) unless `--delay` overrides it.

Examples (PowerShell)
```powershell
# 1) Insert a single test record and exit
python woaf_data_inserter.py --mode once --count 1

# 2) Insert 5 records quickly for testing (5-second delay)
python woaf_data_inserter.py --mode minute --count 5 --delay 5

# 3) Run indefinitely inserting one record per hour
python woaf_data_inserter.py --mode hourly

# 4) Dry-run preview of 3 inserts (no DB writes)
python woaf_data_inserter.py --mode once --count 3 --dry-run

# 5) For testing only: run 'daily' mode but override to 10 seconds delay
python woaf_data_inserter.py --mode daily --delay 10
```

How the script simulates WOAF workflow
- New transactions start at `For QC Approval` and are assigned a QC approver from a small pool.
- The script either creates new transactions or picks an existing `transactionNumber` from `sp_woaf` and appends a history row to simulate status changes.
- Approval flow: QC → BBA → PPC → Booker → Completed
- At each non-final stage there's a small probability the transaction is marked `Disapproved, For Resubmission`, which will cause the next update to route it back to QC.

Dry-run mode
Use `--dry-run` to see the exact stored-proc call and parameters the script would execute. This is safe for validating outputs without touching the database.

Notes
- The script uses Windows Authentication (`Trusted_Connection=yes`) by default. If you need SQL authentication, update the `create_connection()` function in the script.
- The script assumes `InsertTestData_WOAF` accepts the parameter list used in the script. If your stored procedure signature differs, update `insert_test_transaction()` accordingly.
- For production-style use, consider running the script as a scheduled task or service and add robust logging.
