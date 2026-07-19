# SCM Monitoring System - Workflow Tracking Module

A comprehensive web-based monitoring system for tracking supply chain management transactions, approval workflows, and aging alerts.

## Overview

The Workflow Tracking Module is the first module of the SCM Monitoring System, designed to help organizations monitor transaction statuses, track approval stages, and identify aging transactions that require attention.

## Screenshots

### Dashboard Summary
![Dashboard Summary](docs/screenshots/dashboard-summary.png)
> Summary cards showing transaction counts by status and aging level.

---

### Table View
![Table View](docs/screenshots/pending-filter.png)
> Transaction list in table format with status badges and aging indicators.

---

### Card View
![Card View](docs/screenshots/card-view-pending-filter.png)
> Transaction list in card format for easier visual scanning.

---

### Transaction Detail Modal
![Transaction Modal](docs/screenshots/transaction-modal.png)
> Detailed view showing transaction info, SLA thresholds, and workflow timeline.

---

### Reports Module
![Reports Module](docs/screenshots/reports-module.png)
> Reports module show filter, preview and export to Excel or PDF for reports.

---

### Preset Filter Report
![Preset Filter Report](docs/screenshots/filter-preset-report.png)
> Reports module show a preset filter.

---

### PDF Export Report
![PDF Export  Report](docs/screenshots/pdf-export-report.png)
> Reports module exported filtered data to PDF.

---

### Excel Export Report
![Excel Export  Report](docs/screenshots/excel-export-report.png)
> Reports module exported filtered data to Excel.

### Process Flow

```
SQL Server Database
        │
        │  pyodbc queries
        ▼
db_connection.py
        │
        │  returns data to API layer
        ▼
display_data_api.py  (Flask REST API — port 5000)
        │
        │  JSON responses
        ├─────────────────────────────────────────┐
        ▼                                         ▼
workflow-tracking.html                      reports.html
script.js                                   reports.js
        │                                         │
        ├── loadAllTransactionsList()             ├── loadReportData()
        ├── updateDashboardSummary()              ├── populateFilterDropdowns()
        ├── loadDistinctStages()                  ├── applyReportFilters()
        ├── loadDistinctTransactionTypes()        ├── renderReportPreview()
        ├── loadDistinctCurrentPICs()             ├── Suggested Filter Presets (pills)
        ├── applyFilters()                        ├── exportToExcel()  → .xlsx download
        ├── renderTransactions()                  └── exportToPDF()    → .pdf download
        ├── detectNewCriticalTransactions()
        ├── showCriticalAlert() (toast)
        └── openTransactionModal()
                │
                ├── loadWorkflowProgress()
                └── loadSLAInformationDetails()

        Navigation
        ──────────
        workflow-tracking.html  ──[Reports tab]──►  reports.html
        reports.html  ──[Workflow Tracking tab]──►  workflow-tracking.html
```

---

### Polling — Auto Refresh (every 30 seconds)

```
setInterval() ──► refreshCriticalCount()        ──► /api/critical-count
             ──► refreshWarningCount()          ──► /api/warning-count
             ──► refreshNormalCount()           ──► /api/normal-count
             ──► refreshForApprovalCount()      ──► /api/forApproval-count
             ──► refreshPendingCount()          ──► /api/pending-count
             ──► refreshForAdditionalInputCount() ──► /api/forAdditionalInput-count
             ──► refreshCompletedCount()        ──► /api/completed-count
```

---

### User Interaction Flow

```
User clicks "View" button
        │
        ▼
viewTransactionDetails(transactionId)
        │
        ├── Find transaction in currentTransactions[]
        ├── Find SLA info in slaInformationDetails[]
        ├── Filter workflow steps in allTransactionsWorkflowProgress[]
        │
        ▼
Render Modal with 4 sections:
        ├── 📋 Transaction Information  (name, type, stage, PIC, status)
        ├── 🕐 SLA Information          (normal / warning / critical thresholds)
        ├── 📅 Timeline                 (submitted date, last updated)
        └── 🔀 Workflow Progress        (step-by-step history with icons)
```

---

### SLA Aging Classification

```
agingDays from SQL
        │
        ▼
SLA Status (Aging Level)
        ├── 🟢 Normal   → within normal SLA days     → aging-normal  (green pill)
        ├── 🟡 Warning  → approaching SLA deadline    → aging-warning (yellow pill + pulse)
        └── 🔴 Critical → exceeded SLA deadline       → aging-critical (red pill + pulse animation)
```

## Features

### 📊 Dashboard Summary
- **Active Transactions**: Real-time count of ongoing transactions --30 seconds refresh
- **Completed Transactions**: Total completed transactions
- **Aging Transactions**: Transactions requiring attention 
- **Critical Alerts**: High-priority aging transactions 

### 🔍 Advanced Filtering & Search
- **Search**: Find transactions by ID, Vendor, or PO Number
- **Status Filter**: Filter by For Approval, Completed, Pending, or For Additional Input
- **Aging Filter**: Filter by Normal , Warning , or Critical 
*The aging days depends on the sla threshold for each transaction type
- **Stage Filter**: Filter by workflow stage (Submission, Review, Approval, Processing, Completed)

### 📋 Dual View Modes
1. **Table View**: Comprehensive tabular display with all transaction details
2. **Card View**: Visual card-based layout for easier scanning

### 🔄 Workflow Tracking
- Visual timeline showing transaction progress through stages:
  - Submission
  - Approval
  - Completed
- User and timestamp tracking for each completed stage

### ⚠️ Aging Monitoring
- **Normal**: Green indicator
- **Warning**: Orange indicator
- **Critical**: Red indicator

### 📱 Responsive Design
- Fully responsive layout that works on desktop
- Adaptive grid system for optimal viewing on any screen size

## File Structure

```
scm-monitoring-system/
├── workflow-tracking.html    # Main dashboard — transaction list, filters, summary cards
├── reports.html              # Reports module — filter, preview, and export transactions
├── styles.css                # Complete styling, animations, and responsive design
├── script.js                 # Dashboard logic — API fetching, filtering, rendering, alerts
├── reports.js                # Reports logic — preset filters, preview, Excel/PDF export
├── display_data_api.py       # Flask REST API — exposes all endpoints on port 5000
├── db_connection.py          # Database layer — pyodbc SQL Server queries and connections
├── .env                      # Environment variables — DB credentials (never committed)
├── requirements.txt          # Python dependencies
├── docs/
│   └── screenshots/
│       ├── dashboard-summary.png
│       ├── pending-filter.png
│       ├── card-view-pending-filter.png
│       ├── transaction-modal.png
│       ├── reports-module.png
│       ├── preset-filter-report.png
│       ├── pdf-export-report.png
│       └── excel-export-report.png
└── README.md                 # Project documentation
```

## Technologies Used
### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Styling with flexbox, grid, CSS variables, animations, and transitions
- **JavaScript (ES6+)**: Dynamic functionality, API fetching, DOM manipulation, and state management
- **Font Awesome 6.4.0**:  Icon library via CDN for UI icons (status badges, buttons, timeline icons)

### Backend
- **Python 3**: Server-side logic and database querying
- **Flask**: Lightweight web framework for REST API endpoints
- **Flask-CORS**: Cross-Origin Resource Sharing support to allow HTML file to call the Flask API
- **pyodbc**: Python library for connecting and querying the Microsoft SQL Server database

### Database
- **Microsoft SQL Server (MSSQL)**: Primary database storing all transaction data, views, and SLA information
- **T-SQL**: SQL queries and views used to retrieve transactions, counts, workflow progress, and SLA details

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- Python 3+ installed on your machine

### Installation

1. Clone or download the repository to your local machine
2. Navigate to the project directory

### Running the Application

> ⚠️ **Important**: You must start the API server first before opening the HTML file.

**Step 1 — Start the API Server**

Open a terminal in the project directory and run:

```bash
python display_data_api.py
```

Wait until you see the server is running (e.g., `Running on http://localhost:5000`).

**Step 2 — Open the Application**

Once the API server is running, open the HTML file in your browser:

```bash
# Open directly
start workflow-tracking.html
```

**Step 3 — Stopping the Server**

When done, go back to the terminal running the API and press:

```
Ctrl + C
```

### Quick Start Summary

| Step | Command | Description |
|------|---------|-------------|
| 1 | `python display_data_api.py` | Start the API server |
| 2 | Open `workflow-tracking.html` | Launch the application |
| 3 | `Ctrl + C` | Stop the API server when done |


### Usage

1. **View Dashboard** — Summary cards display key metrics by status and aging level. Click any card to instantly filter the transaction list.
2. **Search Transactions** — Use the search box to find specific transactions by name, requestor, stage, PIC, or type.
3. **Apply Filters** — Use dropdown filters to narrow down results by status, aging level, stage, transaction type, and current PIC.
4. **Switch Views** — Toggle between Table View and Card View.
5. **View Details** — Click the View button to open the transaction detail modal showing full information, SLA thresholds, and workflow timeline.
6. **Refresh Data** — Click the Refresh button or wait for the auto-refresh every 30 seconds to get the latest data from SQL Server.
7. **Reports & Export** — Navigate to the Reports module to filter transactions using dropdowns or suggested filter presets, preview the results, then export to **PDF** or **Excel**.


## Key Features Explained

### Transaction Status Badges
- **For Approval**: Blue badge - The transaction has been updated within the last 24 hours and is currently awaiting approval.
- **Transaction Complete**: Green badge - The transaction has been successfully approved and completed.
- **Pending**: Orange badge - The transaction is still awaiting approval, but the last update was made more than 24 hours ago.
- **For Additional Input**: Violet badge - The transaction requires the current approver to provide specific information before it can proceed to the next step in the workflow.

### Aging Indicators
The system automatically calculates aging based on the submission date:
- Transactions are color-coded based on how long they've been in the system
- Critical aging transactions that have exceeded the aging threshold defined by their transaction type's SLA are displayed with a pulsing animation to attract attention.

### Workflow Timeline
Each transaction has a detailed workflow timeline showing:
- All stages of the approval process
- Completion dates and responsible users
- Current stage with visual indicator

### Pagination
- Displays 10 transactions per page
- Easy navigation with Previous/Next buttons
- Current page indicator

## Future Enhancements

Planned features for future releases:
- Email notifications for aging transactions
- Advanced analytics
- Additional modules (Alerts, Analytics)
- Mobile app version

## Performance

- Lightweight and fast loading
- Smooth animations and transitions
- Optimized for large datasets with pagination

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast color scheme
- Clear visual indicators

## License

This project is part of the SCM Monitoring System. All rights reserved.

## Support

For questions or issues, please contact the development team.

## Version History

### v1.0.0 — Initial Release
- Initial release of SCM Monitoring System
- Workflow tracking dashboard with transaction list
- Table view and card view toggle
- Basic search and filter functionality
- Transaction detail modal with workflow timeline
- SLA threshold monitoring per transaction type
- Dashboard summary cards showing status and aging level counts
- Flask REST API connected to SQL Server via pyodbc
- Environment variable configuration for database credentials

### v1.1.0 — Aging & Filter Improvements
- Added aging computation logic per transaction type (MAS, RCP, PR, WOAF, POACR)
- Fixed aging days for completed transactions — now shows closed duration (submitted → last modified)
- Fixed `CROSS APPLY` to `OUTER APPLY` to include transactions with 0 aging days
- Added `Normal` threshold status for transactions submitted on the same day
- Added requestor field to wildcard search
- Dashboard summary cards are now clickable — act as quick filters for the transaction list
- Added transaction count metric — displays `Showing X of Y total transactions`

### v1.2.0 — Alerts & Reports Module
- Added Reports module (`reports.html`, `reports.js`)
- Reports module includes filters by date range, type, status, aging level, PIC, and stage
- Added suggested filter presets for quick common report exports
- Export to Excel (`.xlsx`) and Export to PDF (`.pdf`)
- Fixed submitted date range UI overlap in Reports module
- Updated navigation — Reports tab routes to `reports.html`
 
---

