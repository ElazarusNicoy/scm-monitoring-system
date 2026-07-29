### Test Plan for Process Visibility and SLA-Based Workflow Control System for Supply Chain Management

| Version #  | Date | Author | Revision Details |
| ------------- |:-------------:|------------- |:-------------:|
| 1.0  | 2026-07-27 | Eunica Jeatriz Aguisanda  | Initial draft of the test plan foo     |


## Introduction
## Purpose
  To establish the testing plan, strategy, criteria, tools, and test cases needed to make sure the SCM Monitoring System works reliably, performs well, and is easy to use. It guides all testing for the three main modules (Workflow Tracking, Escalation, and Reports), simulated email alerts, and data exports to ensure the system is ready to launch.

## System Overview
The SCM Monitoring System is a web-based system designed to provide visibility into supply chain management transactions. It features a centralized dashboard for tracking workflows with advanced filtering; automatic age tags (Normal, Warning, Critical); an escalation module to manage critical items with simulated email follow-ups and generation for Excel or PDF reports.

## Scope
The test plan covers all major features of the SCM Monitoring System across its three modules.

### In-Scope:
•	Workflow Tracking: Dashboard summary cards, transaction filtering and search, table/card views, and the transaction detail modal.  

•	SLA Classification: The logic for calculating and displaying Normal, Warning, and Critical aging statuses is data driven. It is configured directly in the MS SQL database using the SLA_Threshold table.  

•	Email Escalation: The pre-filtered view of aged transactions, the manual follow-up workflow, the Outlook-style email preview, and the simulated sending of emails.  

•	Report Generation: Filtering by date/criteria, use of preset filters, report preview, and exporting to both PDF and Excel.  

•	Backend Services: All Flask API endpoints and data synchronization from the SQL Server database.

### Out-of-Scope:
•	Load/Stress Testing of SQL Server Database: This tests the server capacity rather than app functionality.  

•	Testing a Real SMTP Email Server Integration: Testing with a live email server is out of scope for this phase. This avoids the complexity of setting up temporary email accounts. The official company email server will be configured before the final deployment. The current focus is to validate the simulated email content that is generated correctly.  

•	Performance Testing of Third-Party CDN Libraries (SheetJS, jsPDF): The test plan focuses on verifying file export integration, assuming third-party libraries are reliable and excluding their internal performance testing.

## References
•	ISO/IEC/IEEE 29119-3: Software Testing Documentation  

•	ISTQB Foundation Level Syllabus  

## Test Items


| Test Item  | Description | 
| ------------- |:-------------:|
| Dashboard Module  | This test item covers the main landing page of the system. It includes the summary cards that display counts of transactions by status (e.g. Pending, Completed) and by aging level (e.g. Normal, Warning, Critical), as well as the navigation tabs. | 
| Transaction Tracking  | This test item refers to the core feature for viewing and managing the list of all transactions. It includes the table/card view, search and filtering capabilities (by status, aging, type, PIC, etc.) and the pagination controls. | 
| Workflow Tracking  | This test item checks how well the system tracks a transaction’s lifecycle from start to finish. It includes the Transaction Detail Modal, which displays step-by-step progress, user assignments, and date stamps for each stage of a transaction’s approval process. | 
| SLA Classification Module  | This test item is the backend logic and corresponding frontend display that calculates and assigns an aging status (Normal, Warning, or Critical) to each transaction. It validates that the correct status is applied based on the transaction’s age and the predefined business rules in the SLA_Threshold table. | 
| Email Escalation Module  | This test item covers all features within the Escalation tab. This includes the manual “Follow up” workflow, the generation of the Outlook-style email preview modal, the simulated sending of emails, and the automatic detection and notification for newly “Warning/Critical” aged transactions on page load. | 
| Report Generation Module  | This test item includes all functionality on the Reports tab. This covers the user’s ability to apply date range and criteria filters, use suggested filter presets, preview the generated data in a table, and successfully export the final report to both PDF and Excel formats. | 

## Test Environment


| Component  | Specification | 
| ------------- |:-------------:|
| Operating System  | Windows 11 / Windows 10 |
| Browser  | Brave/Microsoft Edge/Google Chrome |
| Backend  | Python (3.8+), Flask |
| Database  | Microsoft SQL Server |
| Frontend  | HTML5, CSS3, JavaScript (ES6+) |
| Network  | Localhost (API server and client running on the same machine) | 

## Unit Testing
### Objective
To verify that individual small parts of the code work correctly on their own before putting the whole system together.

| Module                                            | Description                                                                                                        | Test Date  | Responsibility |
|---------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------|:----------:|:---------------|
| Workflow Tracking: Summary Cards                  | Verify total transaction count metrics across summary cards                                                        | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Summary Cards                  | Validate hover animation (card elevation lift effect) on mouse hover                                               | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Summary Cards                  | Verify dynamic list filtering and updating upon clicking a summary card                                            | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Search Bar                     | Validate real-time search filtering as user inputs characters                                                      | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Transaction List               | Verify transaction list auto-sorting by last modified date (descending order)                                      | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Transaction List               | Validate visual indicators for Warning status (pulsating aging days animation and yellow/orange highlight)         | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Transaction List (Table View)  | Validate Critical status styling (red border accent, light red background, fire icon, and pulsating animation)     | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Transaction List (Card View)   | Verify Critical card layout elements (fire icon near title, SLA status string concatenation, and bottom timestamp row) | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Pagination                     | Verify page navigation preserves default sorting by latest modified date                                           | YYYY-MM-DD | Lead Developer |
| Escalation: Automated Notification                | Validate simulated email toast notification on tab load (displays count and aging category for new Critical/Warning items) | YYYY-MM-DD | Lead Developer |
| Escalation: Summary Cards                         | Verify summary cards dynamically filter strictly for Warning and Critical items                                    | YYYY-MM-DD | Lead Developer |
| Escalation: Aging Transaction (Table and Card View) | Verify the visibility and clickable action of the manual "Follow Up" button                                        | YYYY-MM-DD | Lead Developer |
| Escalation: Refresh button                        | Validate that clicking Refresh resets filtered results and updates the transaction view                            | YYYY-MM-DD | Lead Developer |
| Escalation: Pagination                            | Verify escalation list pagination preserves default sorting by latest modified date                                | YYYY-MM-DD | Lead Developer |
| Reports: Report Filters                           | Verify automatic loading and display of default preset filters on tab entry                                        | YYYY-MM-DD | Lead Developer |
| Reports: Report Filters                           | Validate that resetting filters clears active criteria and re-renders the report preview                           | YYYY-MM-DD | Lead Developer |


## Integration Testing
### Objective
To verify that different parts of the system work together as expected.

| Module                                     | Description                                                                                                                            | Test Date  | Responsibility |
|--------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|:----------:|:---------------|
| Workflow Tracking: Search & Filter Integration | Verify combined query execution when applying search keywords simultaneously with dropdown filters                                     | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Multi-Filter Integration  | Validate compound data filtering when combining multiple dropdown selection criteria                                                     | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Details Modal Integration | Verify real-time SLA state propagation into modal view (including pulsating CSS animation for Warning/Critical states).                | YYYY-MM-DD | Lead Developer |
| Escalation: Details Modal Integration      | Validate conditional modal rendering in Escalation view (verifying intentional reduction of Workflow Progress and SLA timeline). Workflow Progress and SLA Information are removed from the modal. | YYYY-MM-DD | Lead Developer |
| Escalation: Summary Card & Filter Sync     | Verify bi-directional state synchronization between Summary Card selection and Dropdown Filter values.                                   | YYYY-MM-DD | Lead Developer |
| Escalation: Email Simulator Modal          | Verify trigger integration between "Follow Up" action and Outlook-style simulated email preview rendering                                | YYYY-MM-DD | Lead Developer |
| Escalation: Email Recipient Mapping        | Validate automated address populating in email preview (To: Current PIC, CC: Requestor and System Admin).                                | YYYY-MM-DD | Lead Developer |
| Escalation: Dynamic Email Subject Generation | Verify automated subject line construction containing Transaction ID and dynamic urgency prefix (Urgent vs. Attention Required)          | YYYY-MM-DD | Lead Developer |
| Escalation: Dynamic Email Body Generation  | Validate email body data binding (recipient greeting, escalation trigger reason, transaction metadata, and dynamic SharePoint URL).      | YYYY-MM-DD | Lead Developer |
| Escalation: Modal Navigation Control       | Validate "Cancel" action handling (modal dismissal and returning on aging transaction list)                                              | YYYY-MM-DD | Lead Developer |
| Escalation: Simulated Email Dispatch       | Verify "Send Email" execution flow (simulated dispatch trigger, success notification, and status state update).                          | YYYY-MM-DD | Lead Developer |
| Reports: Preset Filter Integration         | Verify responsive display of found transactions in the report preview that are aligned with suggested filters.                           | YYYY-MM-DD | Lead Developer |
| Reports: Custom Query Execution            | Validate query execution merging preset parameters and manual dropdown filters upon clicking "Apply Filter and Preview"                  | YYYY-MM-DD | Lead Developer |
| Reports: Dataset Preview Rendering         | Verify full dataset rendering in Report Preview table matching active criteria (verifying non-paginated scrolling view).                 | YYYY-MM-DD | Lead Developer |
| Reports: File Export Integration           | Verify data pipeline binding between filtered UI dataset and generated physical file outputs (.XLSX and .PDF) to local storage.            | YYYY-MM-DD | Lead Developer |
| Workflow Tracking ↔ Escalation Data Sync   | Verify data alignment for Warning/Critical status counts and item details between Workflow Tracking and Escalation tabs                  | YYYY-MM-DD | Lead Developer |
| Workflow Tracking ↔ Reports Data Sync      | Validate cross-module data alignment across Aging Category, Transaction Type, and Status filters between Tracking and Reporting tab      | YYYY-MM-DD | Lead Developer |
| Escalation ↔ Reports Data Sync             | Verify data alignment between Escalation metrics and Report preset filter query results                                                  | YYYY-MM-DD | Lead Developer |



## System Testing
### Objective
To verify that the complete, integrated system works as expected and meets core user requirements.

| Module                                         | Description                                                                                                                                  | Test Date  | Responsibility |
|------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------|:----------:|:---------------|
| Workflow Tracking: Metric Accuracy & Transparency | Validate system-wide transaction counter accuracy (displaying matching "X out of Y" records) across all applied global filters                 | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: End-to-End Workflow Visibility | Validate that all required transaction metadata, history, and status attributes are completely populated and accessible across views           | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Data Completeness & Accessibility | The completeness of combination of details per transaction and show it and accessible to all users.                                        | YYYY-MM-DD | Lead Developer |
| Workflow Tracking: Centralized Data Integration | Verify seamless cross-module data consistency where centralized transaction records synchronize identically across Workflow Tracking, Escalation, and Reporting modules | YYYY-MM-DD | Lead Developer |


## User Acceptance Testing
### Objective
To verify that individual small parts of code work correctly on their own before putting the whole system together.

| Module                                     | Description                                                                                                                            | Test Date  | Responsibility |
|--------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|:----------:|:---------------|
| Workflow Tracking: Search & Filter Integration | Verify combined query execution when applying search keywords simultaneously with dropdown filters                                     | YYYY-MM-DD | End-User |
| Workflow Tracking: Multi-Filter Integration  | Validate compound data filtering when combining multiple dropdown selection criteria                                                     | YYYY-MM-DD | End-user |
| Workflow Tracking: Details Modal Integration | Verify real-time SLA state propagation into modal view (including pulsating CSS animation for Warning/Critical states).                | YYYY-MM-DD | End-user |
| Escalation: Details Modal Integration      | Validate conditional modal rendering in Escalation view (verifying intentional reduction of Workflow Progress and SLA timeline). Workflow Progress and SLA Information are removed from the modal. | YYYY-MM-DD | End-user |
| Escalation: Summary Card & Filter Sync     | Verify bi-directional state synchronization between Summary Card selection and Dropdown Filter values.                                   | YYYY-MM-DD | End-user |
| Escalation: Email Simulator Modal          | Verify trigger integration between "Follow Up" action and Outlook-style simulated email preview rendering                                | YYYY-MM-DD | End-user |
| Escalation: Email Recipient Mapping        | Validate automated address populating in email preview (To: Current PIC, CC: Requestor and System Admin).                                | YYYY-MM-DD | End-user |
| Escalation: Dynamic Email Subject Generation | Verify automated subject line construction containing Transaction ID and dynamic urgency prefix (Urgent vs. Attention Required)          | YYYY-MM-DD | End-user |
| Escalation: Dynamic Email Body Generation  | Validate email body data binding (recipient greeting, escalation trigger reason, transaction metadata, and dynamic SharePoint URL).      | YYYY-MM-DD | End-user |
| Escalation: Modal Navigation Control       | Validate "Cancel" action handling (modal dismissal and returning on aging transaction list)                                              | YYYY-MM-DD | End-user |
| Escalation: Simulated Email Dispatch       | Verify "Send Email" execution flow (simulated dispatch trigger, success notification, and status state update).                          | YYYY-MM-DD | End-user |
| Reports: Preset Filter Integration         | Verify responsive display of found transactions in the report preview that are aligned with suggested filters.                           | YYYY-MM-DD | End-user |
| Reports: Custom Query Execution            | Validate query execution merging preset parameters and manual dropdown filters upon clicking "Apply Filter and Preview"                  | YYYY-MM-DD | End-user |
| Reports: Dataset Preview Rendering         | Verify full dataset rendering in Report Preview table matching active criteria (verifying non-paginated scrolling view).                 | YYYY-MM-DD | End-user |
| Reports: File Export Integration           | Verify data pipeline binding between filtered UI dataset and generated physical file outputs (.XLSX and .PDF) to local storage.            | YYYY-MM-DD | End-user |
| Workflow Tracking ↔ Escalation Data Sync   | Verify data alignment for Warning/Critical status counts and item details between Workflow Tracking and Escalation tabs                  | YYYY-MM-DD | End-user |
| Workflow Tracking ↔ Reports Data Sync      | Validate cross-module data alignment across Aging Category, Transaction Type, and Status filters between Tracking and Reporting tab      | YYYY-MM-DD | End-user |
| Escalation ↔ Reports Data Sync             | Verify data alignment between Escalation metrics and Report preset filter query results                                                  | YYYY-MM-DD | End-user |
| Workflow Tracking: Search & Filter Integration | Verify combined query execution when applying search keywords simultaneously with dropdown filters                                     | YYYY-MM-DD | End-user |
| Workflow Tracking: Multi-Filter Integration  | Validate compound data filtering when combining multiple dropdown selection criteria                                                     | YYYY-MM-DD | End-user |
| Workflow Tracking: Details Modal Integration | Verify real-time SLA state propagation into modal view (including pulsating CSS animation for Warning/Critical states).                | YYYY-MM-DD | End-user |
| Escalation: Details Modal Integration      | Validate conditional modal rendering in Escalation view (verifying intentional reduction of Workflow Progress and SLA timeline). Workflow Progress and SLA Information are removed from the modal. | YYYY-MM-DD | End-user |
| Escalation: Summary Card & Filter Sync     | Verify bi-directional state synchronization between Summary Card selection and Dropdown Filter values.                                   | YYYY-MM-DD | End-user |
| Escalation: Email Simulator Modal          | Verify trigger integration between "Follow Up" action and Outlook-style simulated email preview rendering                                | YYYY-MM-DD | End-user |
| Escalation: Email Recipient Mapping        | Validate automated address populating in email preview (To: Current PIC, CC: Requestor and System Admin).                                | YYYY-MM-DD | End-user |
| Escalation: Dynamic Email Subject Generation | Verify automated subject line construction containing Transaction ID and dynamic urgency prefix (Urgent vs. Attention Required)          | YYYY-MM-DD | End-user |
| Escalation: Dynamic Email Body Generation  | Validate email body data binding (recipient greeting, escalation trigger reason, transaction metadata, and dynamic SharePoint URL).      | YYYY-MM-DD | End-user |
| Escalation: Modal Navigation Control       | Validate "Cancel" action handling (modal dismissal and returning on aging transaction list)                                              | YYYY-MM-DD | End-user |
| Escalation: Simulated Email Dispatch       | Verify "Send Email" execution flow (simulated dispatch trigger, success notification, and status state update).                          | YYYY-MM-DD | End-user |
| Reports: Preset Filter Integration         | Verify responsive display of found transactions in the report preview that are aligned with suggested filters.                           | YYYY-MM-DD | End-user |
| Reports: Custom Query Execution            | Validate query execution merging preset parameters and manual dropdown filters upon clicking "Apply Filter and Preview"                  | YYYY-MM-DD | End-user |
| Reports: Dataset Preview Rendering         | Verify full dataset rendering in Report Preview table matching active criteria (verifying non-paginated scrolling view).                 | YYYY-MM-DD | End-user |
| Reports: File Export Integration           | Verify data pipeline binding between filtered UI dataset and generated physical file outputs (.XLSX and .PDF) to local storage.            | YYYY-MM-DD | End-user |
| Workflow Tracking ↔ Escalation Data Sync   | Verify data alignment for Warning/Critical status counts and item details between Workflow Tracking and Escalation tabs                  | YYYY-MM-DD | End-user |
| Workflow Tracking ↔ Reports Data Sync      | Validate cross-module data alignment across Aging Category, Transaction Type, and Status filters between Tracking and Reporting tab      | YYYY-MM-DD | End-user |
| Escalation ↔ Reports Data Sync             | Verify data alignment between Escalation metrics and Report preset filter query results                                                  | YYYY-MM-DD | End-user |
| Workflow Tracking: Metric Accuracy & Transparency | Validate system-wide transaction counter accuracy (displaying matching "X out of Y" records) across all applied global filters                 | YYYY-MM-DD | End-user |
| Workflow Tracking: End-to-End Workflow Visibility | Validate that all required transaction metadata, history, and status attributes are completely populated and accessible across views           | YYYY-MM-DD | End-user |
| Workflow Tracking: Data Completeness & Accessibility | The completeness of combination of details per transaction and show it and accessible to all users.                                        | YYYY-MM-DD | End-user |
| Workflow Tracking: Centralized Data Integration | Verify seamless cross-module data consistency where centralized transaction records synchronize identically across Workflow Tracking, Escalation, and Reporting modules | YYYY-MM-DD | End-user |
