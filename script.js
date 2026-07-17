// Function to get SharePoint URL based on transaction type
function getSharePointURL(transactionType, transactionName) {
    const baseURL = 'http://sharepoint/sites/hqservices';
    const urlMap = {
        'RCP': `${baseURL}/RCP/${transactionName}.xml`,
        'PR': `${baseURL}/Purchase%20Requisition/${transactionName}.xml`,
        'MAS': `${baseURL}/Movement%20Approval%20Sheet/${transactionName}.xml`,
        'POACR': `${baseURL}/PO%20Amend%Cancel%Request/${transactionName}.xml`,
        'WOAF': `${baseURL}/Work%20Order%20Amendment%20Form/${transactionName}.xml`
    };
    return urlMap[transactionType] || '#';
}

// Sample transaction data (fallback when API is unavailable)
const sampleTransactions = [
    {
        id: 'TXN-2024-001',
        transactionName: 'P2-03-12345',
        transactionType: 'RCP',
        currentStage: 'Initial Approver',
        currentPIC: 'John Smith',
        status: 'for-approval',
        agingDays: 2,
        submittedDate: '2024-02-28',
        lastUpdated: '2024-03-01',
        requestor: 'Jane Doe'
    },
    {
        id: 'TXN-2024-002',
        transactionName: 'PR-12346',
        transactionType: 'PR',
        currentStage: 'Budget Approver 1',
        currentPIC: 'Sarah Williams',
        status: 'pending',
        agingDays: 16,
        submittedDate: '2024-02-14',
        lastUpdated: '2024-02-29',
        requestor: 'Tom Brown'
    },
    {
        id: 'TXN-2024-003',
        transactionName: 'MAS2026-03-03-224500',
        transactionType: 'MAS',
        currentStage: 'Cost Accounting',
        currentPIC: 'David Lee',
        status: 'for-additional-input',
        agingDays: 12,
        submittedDate: '2024-02-18',
        lastUpdated: '2024-03-01',
        requestor: 'Alice Chen'
    },
    {
        id: 'TXN-2024-004',
        transactionName: 'PR-12347',
        transactionType: 'PR',
        currentStage: 'Request Transaction Completed',
        currentPIC: 'System',
        status: 'completed',
        agingDays: 15,
        submittedDate: '2024-02-10',
        lastUpdated: '2024-02-25',
        requestor: 'Mark Taylor'
    },
    {
        id: 'TXN-2024-005',
        transactionName: 'P5-03-12346',
        transactionType: 'RCP',
        currentStage: 'Requestor',
        currentPIC: 'Peter Garcia',
        status: 'for-approval',
        agingDays: 1,
        submittedDate: '2024-03-01',
        lastUpdated: '2024-03-01',
        requestor: 'Peter Garcia'
    },
    {
        id: 'TXN-2024-006',
        transactionName: '24500',
        transactionType: 'POACR',
        currentStage: 'SCM Managers Approver',
        currentPIC: 'Rachel Green',
        status: 'pending',
        agingDays: 6,
        submittedDate: '2024-02-24',
        lastUpdated: '2024-03-01',
        requestor: 'Quinn Roberts'
    },
    {
        id: 'TXN-2024-007',
        transactionName: 'WOEF2026-03-03-224500',
        transactionType: 'WOAF',
        currentStage: 'BBA Approver',
        currentPIC: 'Steven King',
        status: 'for-additional-input',
        agingDays: 4,
        submittedDate: '2024-02-26',
        lastUpdated: '2024-03-01',
        requestor: 'Tina Moore'
    },
    {
        id: 'TXN-2024-008',
        transactionName: 'P6-02-12348',
        transactionType: 'RCP',
        currentStage: 'Payment Processing',
        currentPIC: 'Victor Chen',
        status: 'for-approval',
        agingDays: 22,
        submittedDate: '2024-02-08',
        lastUpdated: '2024-03-02',
        requestor: 'Wendy Liu'
    }
];

// State management
let currentTransactions = [...sampleTransactions];
let filteredTransactions = [...sampleTransactions];
let backendCriticalCount = 0;
let backendWarningCount = 0;
let backendNormalCount = 0;
let backendForApprovalCount = 0;
let backendPendingCount = 0;
let backendForAdditionalInputCount = 0;
let backendCompletedCount = 0;
let currentPage = 1;
const itemsPerPage = 10;
let currentView = 'table';
let criticalCountPollingInterval = null;
let warningCountPollingInterval = null;
let normalCountPollingInterval = null;
let forApprovalCountPollingInterval = null;
let pendingCountPollingInterval = null;
let forAdditionalInputCountPollingInterval = null;
let completedCountPollingInterval = null;
let slaInformationDetails = [];
let allTransactionsWorkflowProgress = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// page load
function initializeApp() {
    loadAllTransactionsList(); // Load all transactions list from API
    loadSLAInformationDetails(); // Load SLA information details from API
    loadWorkflowProgress(); // Load workflow progress from API
    loadDistinctStages(); // Load distinct stages from API
    loadDistinctTransactionTypes(); // Load distinct transaction types from API
    loadDistinctCurrentPICs(); // Load distinct current PICs from API
    refreshCriticalCount(); // Load critical count from backend
    refreshWarningCount(); // Load warning count from backend
    refreshNormalCount(); // Load normal count from backend
    refreshForApprovalCount(); // Load for approval count from backend
    refreshPendingCount(); // Load pending count from backend
    refreshForAdditionalInputCount(); // Load for additional input count from backend
    refreshCompletedCount(); // Load completed count from backend
    setupEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    startCriticalCountPolling();
    startWarningCountPolling();
    startNormalCountPolling();
    startForApprovalCountPolling();
    startPendingCountPolling();
    startForAdditionalInputCountPolling();
    startCompletedCountPolling();
}

async function loadDistinctCurrentPICs() {
    try {
        const response = await fetch('http://localhost:5000/api/distinct-current-pics');
        const data = await response.json();

        if (data.success) {
            const currentPICFilter = document.getElementById('currentPICFilter');

            // Keep "All PICs" as default first option
            currentPICFilter.innerHTML = '<option value="all">All PICs</option>';

            // Dynamically add each PIC from DB
            data.distinctCurrentPICs.forEach(pic => {
                const option = document.createElement('option');
                option.value = pic.toLowerCase().replace(/\s+/g, '-');
                option.textContent = pic;
                currentPICFilter.appendChild(option);
            });

            console.log('Current PICs loaded:', data.distinctCurrentPICs);
        }
    } catch (error) {
        console.warn('Distinct current PICs API not available:', error.message);
    }
}

async function loadDistinctTransactionTypes() {
    try {
        const response = await fetch('http://localhost:5000/api/distinct-transaction-types');
        const data = await response.json();

        if (data.success) {
            const typeFilter = document.getElementById('transactionTypeFilter');

            // Keep "All Types" as default first option
            typeFilter.innerHTML = '<option value="all">All Types</option>';

            // Dynamically add each type from DB
            data.distinctTransactionTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.toLowerCase().replace(/\s+/g, '-');
                option.textContent = type;
                typeFilter.appendChild(option);
            });

            console.log('Transaction types loaded:', data.distinctTransactionTypes);
        }
    } catch (error) {
        console.warn('Distinct transaction types API not available:', error.message);
    }
}

async function loadDistinctStages() {
    try {
        const response = await fetch('http://localhost:5000/api/distinct-stages');
        const data = await response.json();

        if (data.success) {
            const stageFilter = document.getElementById('stageFilter');

            // Keep "All Stages" as default first option
            stageFilter.innerHTML = '<option value="all">All Stages</option>';

            // Dynamically add each stage from DB
            data.distinctStages.forEach(stage => {
                const option = document.createElement('option');
                option.value = stage.toLowerCase().replace(/\s+/g, '-');
                option.textContent = stage;
                stageFilter.appendChild(option);
            });

            console.log('Stages loaded:', data.stages);
        }
    } catch (error) {
        console.warn('Distinct stages API not available:', error.message);
    }
}

async function loadWorkflowProgress() {
    try {
        const response = await fetch('http://localhost:5000/api/all_transactions_workflow_progress');
        const data = await response.json();

        console.log('Raw workflow API response:', data);         //see full response
        console.log('Response keys:', Object.keys(data)); 

        if (data.success) {
            // Check which key actually exists
            const workflowKey = data.allTransactionWorkflowProgress 
                             || data.allTransactionsWorkflowProgress
                             || data.workflowProgress
                             || data.data
                             || [];

            allTransactionsWorkflowProgress = data.allTransactionsWorkflowProgress || [];
            console.log('Workflow rows loaded:', allTransactionsWorkflowProgress.length);
            console.log('Workflow sample row:', allTransactionsWorkflowProgress[0]);
        }
    } catch (error) {
        console.warn('Workflow progress API not available:', error.message);
    }
}

async function loadSLAInformationDetails() {
    try {
        const response = await fetch('http://localhost:5000/api/sla_information_details');
        const data = await response.json();

        if (data.success) {
            slaInformationDetails = data.slaInformationDetails;
            console.log('SLA Information Details loaded:', slaInformationDetails);
        } else {
            console.warn('SLA Information Details API error:', data.error);
        }
    } catch (error) {
        console.warn('SLA Information Details API not available:', error.message);
    }
}
// Load all transactions from /api/all_transactions_list
async function loadAllTransactionsList() {
    try {
        console.log('Loading all transactions list from API...');
        const response = await fetch('http://localhost:5000/api/all_transactions_list');
        const data = await response.json();

        if (data.success) {
            console.log(`Loaded ${data.allTransactionList.length} transactions from all_transactions_list`);
            console.log('Sample row:', data.allTransactionList[0]); //debug: see actual keys

            // Column names match exactly what the SQL SELECT returns
            const mappedTransactions = data.allTransactionList.map(t => ({
                id: t['Transaction Name'] || 'N/A',
                transactionType: t['Transaction Type'] || 'N/A',
                transactionName: t['Transaction Name'] || 'N/A',
                currentStage: t['Current Stage'] || 'TBD',
                currentPIC: t['Current PIC'] || 'Unassigned',
                status: (t['Status'] || 'pending')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-'),
                agingDays: t['Aging (Days)'] || 0,
                agingLevel: (t['SLA Status'] || 'normal')
                    .toLowerCase()
                    .trim(),
                submittedDate: t['Submitted Date'] || 'N/A',  
                lastUpdated: t['Last Updated'] || 'N/A',      
                requestor: t['Requestor'] || 'N/A'            
            }));

            // Update global state
            currentTransactions = mappedTransactions;
            filteredTransactions = mappedTransactions;

            // Re-render the table
            applyFilters();
            updateDashboardSummary();

        } else {
            console.error('all_transactions_list API error:', data.error);
        }
    } catch (error) {
        console.warn('all_transactions_list API not available:', error.message);
        currentTransactions = [];
        filteredTransactions = [];
        applyFilters();
    }
}

// Refreshes the critical count from the /api/critical-count endpoint
async function refreshCriticalCount() {
    try {
        const response = await fetch('http://localhost:5000/api/critical-count');
        const data = await response.json();
        
        if (data.success) {
            backendCriticalCount = data.criticalCount;
            document.getElementById('criticalCount').textContent = backendCriticalCount;
            console.log(`Critical count refreshed: ${backendCriticalCount}`);
        } else {
            console.warn('Critical count API error:', data.error);
        }
    } catch (error) {
        console.warn('Critical count API not available:', error.message);
    }
}

// Start periodic polling for critical count
function startCriticalCountPolling() {
    // Poll every 30 seconds to keep critical count up-to-date
    if (criticalCountPollingInterval) {
        clearInterval(criticalCountPollingInterval);
    }
    criticalCountPollingInterval = setInterval(refreshCriticalCount, 30000);
    console.log('Critical count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopCriticalCountPolling() {
    if (criticalCountPollingInterval) {
        clearInterval(criticalCountPollingInterval);
        criticalCountPollingInterval = null;
        console.log('Critical count polling stopped');
    }
}

async function refreshWarningCount() {
    try {
        const response = await fetch('http://localhost:5000/api/warning-count');
        const data = await response.json();
        
        if (data.success) {
            backendWarningCount = data.warningCount;
            document.getElementById('warningCount').textContent = backendWarningCount;
            console.log(`Warning count refreshed: ${backendWarningCount}`);
        } else {
            console.warn('Warning count API error:', data.error);
        }
    } catch (error) {
        console.warn('Warning count API not available:', error.message);
    }
}

// Start periodic polling for warning count
function startWarningCountPolling() {
    // Poll every 30 seconds to keep warning count up-to-date
    if (warningCountPollingInterval) {
        clearInterval(warningCountPollingInterval);
    }
    warningCountPollingInterval = setInterval(refreshWarningCount, 30000);
    console.log('Warning count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopWarningCountPolling() {
    if (warningCountPollingInterval) {
        clearInterval(warningCountPollingInterval);
        warningCountPollingInterval = null;
        console.log('Warning count polling stopped');
    }
}

async function refreshNormalCount() {
    try {
        const response = await fetch('http://localhost:5000/api/normal-count');
        const data = await response.json();
        
        if (data.success) {
            backendNormalCount = data.normalCount;
            document.getElementById('normalCount').textContent = backendNormalCount;
            console.log(`Normal count refreshed: ${backendNormalCount}`);
        } else {
            console.warn('Normal count API error:', data.error);
        }
    } catch (error) {
        console.warn('Normal count API not available:', error.message);
    }
}

// Start periodic polling for normal count
function startNormalCountPolling() {
    // Poll every 30 seconds to keep normal count up-to-date
    if (normalCountPollingInterval) {
        clearInterval(normalCountPollingInterval);
    }
    normalCountPollingInterval = setInterval(refreshNormalCount, 30000);
    console.log('Normal count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopNormalCountPolling() {
    if (normalCountPollingInterval) {
        clearInterval(normalCountPollingInterval);
        normalCountPollingInterval = null;
        console.log('Normal count polling stopped');
    }
}

async function refreshForApprovalCount() {
    try {
        const response = await fetch('http://localhost:5000/api/forApproval-count');
        const data = await response.json();
        
        if (data.success) {
            backendForApprovalCount = data.forApprovalCount;
            document.getElementById('forApprovalCount').textContent = backendForApprovalCount;
            console.log(`For Approval count refreshed: ${backendForApprovalCount}`);
        } else {
            console.warn('For Approval count API error:', data.error);
        }
    } catch (error) {
        console.warn('For Approval count API not available:', error.message);
    }
}

// Start periodic polling for For Approval count
function startForApprovalCountPolling() {
    // Poll every 30 seconds to keep For Approval count up-to-date
    if (forApprovalCountPollingInterval) {
        clearInterval(forApprovalCountPollingInterval);
    }
    forApprovalCountPollingInterval = setInterval(refreshForApprovalCount, 30000);
    console.log('For Approval count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopForApprovalCountPolling() {
    if (forApprovalCountPollingInterval) {
        clearInterval(forApprovalCountPollingInterval);
        forApprovalCountPollingInterval = null;
        console.log('For Approval count polling stopped');
    }
}

async function refreshPendingCount() {
    try {
        const response = await fetch('http://localhost:5000/api/pending-count');
        const data = await response.json();
        
        if (data.success) {
            backendPendingCount = data.pendingCount;
            document.getElementById('pendingCount').textContent = backendPendingCount;
            console.log(`Pending count refreshed: ${backendPendingCount}`);
        } else {
            console.warn('Pending count API error:', data.error);
        }
    } catch (error) {
        console.warn('Pending count API not available:', error.message);
    }
}

// Start periodic polling for Pending count
function startPendingCountPolling() {
    // Poll every 30 seconds to keep Pending count up-to-date
    if (pendingCountPollingInterval) {
        clearInterval(pendingCountPollingInterval);
    }
    pendingCountPollingInterval = setInterval(refreshPendingCount, 30000);
    console.log('Pending count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopPendingCountPolling() {
    if (pendingCountPollingInterval) {
        clearInterval(pendingCountPollingInterval);
        pendingCountPollingInterval = null;
        console.log('Pending count polling stopped');
    }
}

async function refreshForAdditionalInputCount() {
    try {
        const response = await fetch('http://localhost:5000/api/forAdditionalInput-count');
        const data = await response.json();
        
        if (data.success) {
            backendForAdditionalInputCount = data.forAdditionalInputCount;
            document.getElementById('additionalInputCount').textContent = backendForAdditionalInputCount;
            console.log(`For Additional Input count refreshed: ${backendForAdditionalInputCount}`);
        } else {
            console.warn('For Additional Input count API error:', data.error);
        }
    } catch (error) {
        console.warn('For Additional Input count API not available:', error.message);
    }
}

// Start periodic polling for For Additional Input count
function startForAdditionalInputCountPolling() {
    // Poll every 30 seconds to keep For Additional Input count up-to-date
    if (forAdditionalInputCountPollingInterval) {
        clearInterval(forAdditionalInputCountPollingInterval);
    }
    forAdditionalInputCountPollingInterval = setInterval(refreshForAdditionalInputCount, 30000);
    console.log('For Additional Input count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopForAdditionalInputCountPolling() {
    if (forAdditionalInputCountPollingInterval) {
        clearInterval(forAdditionalInputCountPollingInterval);
        forAdditionalInputCountPollingInterval = null;
        console.log('For Additional Input count polling stopped');
    }
}

async function refreshCompletedCount() {
    try {
        const response = await fetch('http://localhost:5000/api/completed-count');
        const data = await response.json();
        
        if (data.success) {
            backendCompletedCount = data.completedCount;
            document.getElementById('completedCount').textContent = backendCompletedCount;
            console.log(`Completed Transaction count refreshed: ${backendCompletedCount}`);
        } else {
            console.warn('Completed Transaction count API error:', data.error);
        }
    } catch (error) {
        console.warn('Completed Transaction count API not available:', error.message);
    }
}

// Start periodic polling for Completed Transaction count
function startCompletedCountPolling() {
    // Poll every 30 seconds to keep Completed Transaction count up-to-date
    if (completedCountPollingInterval) {
        clearInterval(completedCountPollingInterval);
    }
    completedCountPollingInterval = setInterval(refreshCompletedCount, 30000);
    console.log('Completed Transaction count polling started (every 30 seconds)');
}

// Stop periodic polling (useful if needed)
function stopCompletedCountPolling() {
    if (completedCountPollingInterval) {
        clearInterval(completedCountPollingInterval);
        completedCountPollingInterval = null;
        console.log('Completed Transaction count polling stopped');
    }
}

// Update your existing functions to use API data
async function initializeDashboard() {
    console.log('Initializing dashboard...');

    // Load data from API instead of using sample data
    const apiData = await loadTransactionsFromAPI();

    // If API data is empty, show no data message
    if (apiData.length === 0) {
        console.warn('No data available from API');
        showNoDataMessage();
        return;
    }

    // Update the dashboard with API data
    renderTransactions();
    updateDashboardSummary();

}

// Helper functions for user feedback
function showLoadingMessage() {
    // Later, add a loading spinner or a message for the user
    console.log('Loading...');
}

function hideLoadingMessage() {
    console.log('Loading complete');
}

function showNoDataMessage() {
    const tableBody = document.querySelector('#transactionTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6">No transactions found</td></tr>';
    }
}

function showErrorMessage() {
    alert('Failed to load data. Please check if the API server is running.');
}


// Update dashboard summary cards
function updateDashboardSummary() {
    document.getElementById('forApprovalCount').textContent = backendForApprovalCount;
    document.getElementById('pendingCount').textContent = backendPendingCount;
    document.getElementById('additionalInputCount').textContent = backendForAdditionalInputCount;
    document.getElementById('completedCount').textContent = backendCompletedCount;
    document.getElementById('normalCount').textContent = backendNormalCount;
    document.getElementById('warningCount').textContent = backendWarningCount;
    document.getElementById('criticalCount').textContent = backendCriticalCount;
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('currentTime').textContent = now.toLocaleString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('agingFilter').addEventListener('change', applyFilters);
    document.getElementById('stageFilter').addEventListener('change', applyFilters);
    document.getElementById('transactionTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('currentPICFilter').addEventListener('change', applyFilters);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('transactionModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const agingFilter = document.getElementById('agingFilter').value;
    const stageFilter = document.getElementById('stageFilter').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    const currentPICFilter = document.getElementById('currentPICFilter').value;

    filteredTransactions = currentTransactions.filter(transaction => {
        const matchesSearch = searchTerm === '' || 
            transaction.transactionName.toLowerCase().includes(searchTerm) ||
            transaction.currentStage.toLowerCase().includes(searchTerm) ||
            transaction.status.toLowerCase().includes(searchTerm) ||
            transaction.currentPIC.toLowerCase().includes(searchTerm) ||
            getStatusDisplayName(transaction.status).toLowerCase().includes(searchTerm) || // readable: "For Approval"
            transaction.transactionType.toLowerCase().includes(searchTerm) ||   // Transaction Type
            transaction.requestor.toLowerCase().includes(searchTerm);           // Requestor

        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchesAging = agingFilter === 'all' || transaction.agingLevel === agingFilter;

        const normalizedStage = transaction.currentStage.toLowerCase().replace(/\s+/g, '-');
        const matchesStage = stageFilter === 'all' || normalizedStage === stageFilter;

        const normalizedType = transaction.transactionType.toLowerCase().replace(/\s+/g, '-');
        const matchesType = typeFilter === 'all' || normalizedType === typeFilter;

        const normalizedPIC = transaction.currentPIC.toLowerCase().replace(/\s+/g, '-');
        const matchesPIC = currentPICFilter === 'all' || normalizedPIC === currentPICFilter;

        return matchesSearch && matchesStatus && matchesAging && matchesStage && matchesType && matchesPIC;
    });

    currentPage = 1;
    renderTransactions();
}

// Refresh data
function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn.querySelector('i');
    
    icon.style.animation = 'spin 1s linear';

    //Explicit call on refresh
    Promise.all([
        loadAllTransactionsList(),
        // loadTransactionsFromAPI(), 
        refreshCriticalCount(),
        refreshWarningCount(),
        refreshNormalCount(),
        refreshForApprovalCount(),
        refreshPendingCount(),
        refreshForAdditionalInputCount(),
        refreshCompletedCount()
    ]).then(() => {
        applyFilters();
        icon.style.animation = '';
    });
}

// Switch view (table/card)
function switchView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    if (view === 'table') {
        document.getElementById('tableView').classList.remove('hidden');
        document.getElementById('cardView').classList.add('hidden');
    } else {
        document.getElementById('tableView').classList.add('hidden');
        document.getElementById('cardView').classList.remove('hidden');
    }
    
    renderTransactions();
}

// Render transactions
function renderTransactions() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    if (currentView === 'table') {
        renderTableView(paginatedTransactions);
    } else {
        renderCardView(paginatedTransactions);
    }

    updatePagination();
}

// Get status display name
function getStatusDisplayName(status) {
    const statusNames = {
        'for-approval': 'For Approval',
        'pending': 'Pending',
        'for-additional-input': 'For Additional Input',
        'transaction-complete': 'Transaction Complete'
    };
    return statusNames[status] || status;
}

// Render table view
function renderTableView(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
     transactions.forEach(t => console.log('Status value:', t.status, '| Class applied:', `status-${t.status}`));
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => {
        const slaLevel = transaction.agingLevel || 'normal';
        const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);

        // Add row-critical class if aging is critical
        const rowClass = slaLevel === 'critical' ? 'row-critical' : '';

        return `
        <tr class="${rowClass}">
            <td><a href="${sharePointURL}" target="_blank" class="transaction-link" title="Open in SharePoint">${transaction.transactionName}</a></td>
            <td>${transaction.currentStage}</td>
            <td>${transaction.currentPIC}</td>
            <td><span class="status-badge status-${transaction.status}">${getStatusDisplayName(transaction.status)}</span></td>
            <td>
                <span class="aging-indicator aging-${slaLevel}">
                    ${slaLevel === 'critical' ? '<i class="fas fa-fire" style="margin-right:4px"></i>' : ''}
                    ${transaction.agingDays} days
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaction.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        </tr>
        `}).join('');
}

// Render card view
function renderCardView(transactions) {
    const container = document.getElementById('cardView');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">No transactions found</p>';
        return;
    }

    container.innerHTML = transactions.map(transaction => {
        const slaLevel = transaction.agingLevel || 'normal';
        const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);

        // Add card-critical-aging class if aging is critical
        const cardClass = slaLevel === 'critical' ? 'transaction-card card-critical-aging' : 'transaction-card';
        
        return `
        <div class="${cardClass}">
            <div class="card-header">
                <div class="card-id">
                    <a href="${sharePointURL}" target="_blank" class="transaction-link">${transaction.transactionName}</a>
                    ${slaLevel === 'critical' ? '<i class="fas fa-fire" style="color:#ef4444; margin-left:6px" title="Critical SLA exceeded"></i>' : ''}
                </div>
                <span class="status-badge status-${transaction.status}">${getStatusDisplayName(transaction.status)}</span>
            </div>
            <div class="card-body">
                <div class="card-row">
                    <span class="card-label">Type:</span>
                    <span class="card-value">${transaction.transactionType}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Current Stage:</span>
                    <span class="card-value">${transaction.currentStage}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Current PIC:</span>
                    <span class="card-value">${transaction.currentPIC}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">SLA Status:</span>
                    <span class="aging-indicator aging-${slaLevel}">${transaction.agingDays} days - ${slaLevel.toUpperCase()}</span>
                </div>
            </div>
            <div class="card-footer">
                <span style="font-size: 0.85rem; color: var(--text-secondary);">
                    Updated: ${transaction.lastUpdated}
                </span>
                <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaction.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
        `}).join('');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getTimelineIcon(workflowProgress) {
    if (!workflowProgress) 
        return '<i class="fas fa-circle" style="color: var(--border-color)"></i>';

    const progress = workflowProgress.toLowerCase();

    // Keyword-based matching — works for any transaction type
    if (progress.includes('disapproved') || progress.includes('rejected'))
        return '<i class="fas fa-times-circle" style="color: #ef4444"></i>';         // 🔴 Red

    if (progress.includes('resubmitted'))
        return '<i class="fas fa-redo-alt" style="color: #fbbf24"></i>';             // 🟡 Yellow

    if (progress.includes('completed'))
        return '<i class="fas fa-check-circle" style="color: var(--success-color)"></i>'; // 🟢 Green

    if (progress.includes('pending') || progress.includes('for '))
        return '<i class="fas fa-hourglass-half" style="color: #fbbf24"></i>';       // 🟡 Yellow

    // Fallback for anything unrecognized
    return '<i class="fas fa-circle-dot" style="color: var(--border-color)"></i>';   // ⚪ Grey
}

function getTimelineStatusClass(workflowProgress) {
    if (!workflowProgress) return 'not-started';

    const progress = workflowProgress.toLowerCase();

    // Keyword-based — handles any progress name
    if (progress.includes('disapproved') || progress.includes('rejected')) return 'disapproved';
    if (progress.includes('resubmitted'))  return 'resubmitted';
    if (progress.includes('completed'))    return 'completed';
    if (progress.includes('pending') || progress.includes('for ')) return 'in-progress';

    return 'not-started';
}

function renderWorkflowTimeline(workflowSteps) {
    if (!workflowSteps || workflowSteps.length === 0) {
        return '<p style="color: var(--text-secondary); font-size: 0.85rem;">No workflow data available.</p>';
    }

    return `
        <div class="workflow-timeline">
            ${workflowSteps.map(step => {
                // Use 'Workflow Progress' as the displayed stage name
                const workflowProgress = step['Workflow Progress'] || '';
                const statusClass     = getTimelineStatusClass(workflowProgress);
                const modifiedDate    = step['Last Modified Date'] || null;
                const modifiedBy      = step['Last Modified By'] || 'Unassigned';

                return `
                <div class="timeline-item ${statusClass}">
                    <div class="timeline-item-header">
                        ${getTimelineIcon(workflowProgress)}
                        <strong>${workflowProgress}</strong>
                    </div>
                    <div class="timeline-item-sub">
                        <i class="fas fa-user" style="font-size:0.75rem"></i> ${modifiedBy}
                        ${modifiedDate
                            ? `&bull; <i class="fas fa-calendar" style="font-size:0.75rem"></i> ${modifiedDate}`
                            : ''}
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

// View transaction details
function viewTransactionDetails(transactionId) {
    const transaction = currentTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Step 1 — check what transaction was clicked
    console.log('Transaction clicked:', transaction);
    console.log('Transaction Name:', transaction.transactionName);

    // Step 2 — check total workflow data loaded
    console.log('Total workflow rows loaded:', allTransactionsWorkflowProgress.length);

    // Step 3 — check sample row keys
    console.log('Workflow sample row:', allTransactionsWorkflowProgress[0]);


    const slaLevel = transaction.agingLevel || 'normal';
    const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);
    const slaInfo = slaInformationDetails.find(s => s.transactionType === transaction.transactionType);
    const workflowSteps = allTransactionsWorkflowProgress.filter(
        w => w['Transaction Name'] === transaction.transactionName
    );

    console.log('Filtered workflow steps:', workflowSteps);


    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Transaction Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Transaction Name</span>
                    <span class="detail-value"><a href="${sharePointURL}" target="_blank" class="transaction-link">${transaction.transactionName}</a></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Transaction Type</span>
                    <span class="detail-value">${transaction.transactionType}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Current Stage</span>
                    <span class="detail-value">${transaction.currentStage}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Current PIC</span>
                    <span class="detail-value">${transaction.currentPIC}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value"><span class="status-badge status-${transaction.status}">${getStatusDisplayName(transaction.status)}</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">SLA Status</span>
                    <span class="detail-value"><span class="aging-indicator aging-${slaLevel}">${transaction.agingDays} days - ${slaLevel.toUpperCase()}</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Requestor</span>
                    <span class="detail-value">${transaction.requestor}</span>
                </div>
            </div>
        </div>

         <div class="detail-section">
            <h3><i class="fas fa-solid fa-clock"></i> SLA Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Normal SLA</span>
                    <span class="detail-value">
                        <span class="aging-indicator aging-normal">
                            ${slaInfo ? slaInfo['Normal SLA'] : 'N/A'}
                        </span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Warning SLA</span>
                    <span class="detail-value">
                        <span class="aging-indicator aging-warning">
                            ${slaInfo ? slaInfo['Warning SLA'] : 'N/A'}
                        </span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Critical SLA</span>
                    <span class="detail-value">
                        <span class="aging-indicator aging-critical">
                            ${slaInfo ? slaInfo['Critical SLA'] : 'N/A'}
                        </span>
                    </span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3><i class="fas fa-calendar-alt"></i> Timeline</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Submitted Date</span>
                    <span class="detail-value">${transaction.submittedDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Last Updated</span>
                    <span class="detail-value">${transaction.lastUpdated}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3><i class="fas fa-share-nodes"></i> Workflow Progress</h3>
            ${renderWorkflowTimeline(workflowSteps)}
        </div>

       
    `;

    document.getElementById('transactionModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

// Add CSS animation for refresh button
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
