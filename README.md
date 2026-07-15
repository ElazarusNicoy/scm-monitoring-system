# SCM Monitoring System - Workflow Tracking Module

A comprehensive web-based monitoring system for tracking supply chain management transactions, approval workflows, and aging alerts.

## Overview

The Workflow Tracking Module is the first module of the SCM Monitoring System, designed to help organizations monitor transaction statuses, track approval stages, and identify aging transactions that require attention.

### Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│                  workflow-tracking.html                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │  1. Opens the web page
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (script_v2.js)                      │
│                                                                 │
│  initializeApp()                                                │
│  ├── loadAllTransactionsList()     → fetches transaction list   │
│  ├── loadSLAInformationDetails()   → fetches SLA thresholds     │
│  ├── loadWorkflowProgress()        → fetches workflow history   │
│  ├── refreshCriticalCount()        → fetches critical count     │
│  ├── refreshWarningCount()         → fetches warning count      │
│  ├── refreshNormalCount()          → fetches normal count       │
│  ├── refreshForApprovalCount()     → fetches for approval count │
│  ├── refreshPendingCount()         → fetches pending count      │
│  ├── refreshForAdditionalInputCount() → fetches input count     │
│  └── refreshCompletedCount()       → fetches completed count    │
└─────────────────────┬───────────────────────────────────────────┘
                      │  2. Sends HTTP GET requests to API
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  REST API (display_data_api.py)                 │
│                     Flask — port 5000                           │
│                                                                 │
│  Endpoints:                                                     │
│  ├── GET /api/all_transactions_list                             │
│  ├── GET /api/sla_information_details                           │
│  ├── GET /api/all_transactions_workflow_progress                │
│  ├── GET /api/critical-count                                    │
│  ├── GET /api/warning-count                                     │
│  ├── GET /api/normal-count                                      │
│  ├── GET /api/forApproval-count                                 │
│  ├── GET /api/pending-count                                     │
│  ├── GET /api/forAdditionalInput-count                          │
│  └── GET /api/completed-count                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │  3. Calls database query functions
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│               DATABASE LAYER (db_connection.py)                 │
│                        pyodbc                                   │
│                                                                 │
│  Functions:                                                     │
│  ├── get_all_transactions_list()                                │
│  ├── get_SLA_InformationDetails()                               │
│  ├── get_all_transactions_workflow_progress()                   │
│  ├── get_critical_transactions_count()                          │
│  ├── get_warning_transactions_count()                           │
│  ├── get_normal_transactions_count()                            │
│  ├── get_forApproval_transactions_count()                       │
│  ├── get_Pending_transactions_count()                           │
│  ├── get_ForAdditionalInput_transactions_count()                │
│  └── get_Complete_transactions_count()                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │  4. Executes SQL queries via ODBC
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           Microsoft SQL Server (SP_TRANSACTIONS)                │
│                                                                 │
│  Tables / Views:                                                │
│  ├── all_transactions_list              → transaction list      │
│  ├── all_transactions_workflow_progress → workflow history      │
│  ├── SLA_InformationDetails             → SLA thresholds        │
│  ├── critical_transactions_count_view   → critical count        │
│  ├── warning_transactions_count_view    → warning count         │
│  ├── normal_transactions_count_view     → normal count          │
│  ├── ForApproval_transactions_count_view                        │
│  ├── Pending_transactions_count_view                            │
│  ├── ForAdditionalInput_transactions_count_view                 │
│  └── Completed_transactions_count_view                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Data Flow — Transaction List Display

```
SQL Server → db_connection.py → display_data_api.py → script_v2.js → HTML Table
    │               │                   │                   │
    │  Raw rows      │  list of dicts    │  JSON response    │  Mapped objects
    │  (pyodbc)      │  (formatted       │  { success,       │  rendered into
    │               │   dates)          │  allTransaction   │  <tr> rows
    │               │                   │  List: [...] }    │  or cards
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
- **Status Filter**: Filter by Active, Completed, Pending, or Rejected
- **Aging Filter**: Filter by Normal , Warning , or Critical 
*The aging days depends on the sla threshold for each transaction type
- **Stage Filter**: Filter by workflow stage (Submission, Review, Approval, Processing, Completed)

### 📋 Dual View Modes
1. **Table View**: Comprehensive tabular display with all transaction details
2. **Card View**: Visual card-based layout for easier scanning

### 🔄 Workflow Tracking
- Visual timeline showing transaction progress through stages:
  - Submission
  - Review
  - Approval
  - Processing
  - Completed
- Color-coded status indicators (Green: Completed, Orange: Current, Blue: Pending)
- User and timestamp tracking for each stage

### ⚠️ Aging Monitoring
- **Normal**: Green indicator
- **Warning**: Orange indicator
- **Critical**: Red indicator

### 🎯 Priority Management
- **Low Priority**: Green badge with down arrow
- **Medium Priority**: Orange badge with minus icon
- **High Priority**: Red badge with up arrow

### 📱 Responsive Design
- Fully responsive layout that works on desktop, tablet, and mobile devices
- Adaptive grid system for optimal viewing on any screen size

## File Structure

```
scm-monitoring-system/
├── workflow-tracking.html    # Main HTML structure
├── styles.css                # Complete styling and animations
├── script.js                 # JavaScript functionality and data management
├── analysis-planning.txt     # Project analysis and planning document
├── designing.txt             # Design specifications
└── README.md                 # This file
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

1. **View Dashboard**: The dashboard displays summary cards with key metrics
2. **Search Transactions**: Use the search box to find specific transactions
3. **Apply Filters**: Use dropdown filters to narrow down results
4. **Switch Views**: Toggle between Table View and Card View
5. **View Details**: Click "View" or "View Details" button to see complete transaction information
6. **Monitor Workflow**: Check the workflow timeline in the detail modal to track progress
7. **Refresh Data**: Click the Refresh button to update the display

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

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Future Enhancements

Planned features for future releases:
- Real-time data integration with backend API
- Export functionality (PDF, Excel)
- Email notifications for aging transactions
- Advanced analytics and reporting
- User authentication and role-based access
- Additional modules (Alerts, Reports, Analytics)
- Mobile app version

## Performance

- Lightweight and fast loading
- Efficient DOM manipulation
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

- **v1.0.0** (March 2024) - Initial release with Workflow Tracking Module
  - Dashboard summary cards
  - Transaction list with table and card views
  - Advanced filtering and search
  - Workflow timeline visualization
  - Aging monitoring with color-coded indicators
  - Responsive design

---

**Note**: This is the first module of the complete SCM Monitoring System. Additional modules (Alerts, Reports, Analytics) will be added in future releases.
