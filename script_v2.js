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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// page load
function initializeApp() {
    loadTransactionsFromAPI(); // Load from database first
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

// Load transactions from API (Approach 1: REST API Endpoint)
async function loadTransactionsFromAPI() {
    try {
        console.log('Attempting to load data from API...');
        const response = await fetch('http://localhost:5000/api/transactions');
        const data = await response.json();

        if (data.success) {
            console.log(`Loaded ${data.count} transactions from database`);
            
            // The database view now provides simplified, ready-to-display data
            const apiTransactions = data.data.map(transaction => ({
                id: transaction.transactionNumber || transaction.id || 'N/A',
                transactionName: transaction.transactionNumber || transaction.id || 'N/A',
                transactionType: transaction.transactionType || 'N/A',
                currentStage: transaction.currentStage || 'Pending',
                currentPIC: transaction.currentPIC || 'Unassigned',
                status: transaction.status || 'pending',
                agingLevel: transaction.agingLevel || 'normal',
                agingDays: transaction.agingDays || 0,
                submittedDate: transaction.submittedDate || '',
                lastUpdated: transaction.lastUpdated || '',
                requestor: transaction.requestor || 'Unknown'
            }));
            
            // Update global state with API data
            currentTransactions = apiTransactions;
            filteredTransactions = apiTransactions;
            
            // Re-render the dashboard
            applyFilters();
            updateDashboardSummary();
            
            return apiTransactions;
        } else {
            console.error('API Error:', data.error);
            throw new Error('API returned error');
        }
    } catch (error) {
        console.warn('API not available:', error.message);
        currentTransactions = [];
        filteredTransactions = [];
        applyFilters();
        updateDashboardSummary();
        return [];
    }
}

// Approach 2: Dedicated endpoint for critical count only
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
    document.getElementById('additionalInputCount').textContent = backendAdditionalInputCount;
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

    filteredTransactions = currentTransactions.filter(transaction => {
        const matchesSearch = searchTerm === '' || 
            transaction.transactionName.toLowerCase().includes(searchTerm) ||
            transaction.currentStage.toLowerCase().includes(searchTerm) ||
            transaction.status.toLowerCase().includes(searchTerm) ||
            transaction.currentPIC.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

        let matchesAging = true;
        if (agingFilter !== 'all') {
            matchesAging = transaction.agingLevel === agingFilter;
        }

        const matchesStage = stageFilter === 'all' || transaction.currentStage.toLowerCase().includes(stageFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesAging && matchesStage;
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
        loadTransactionsFromAPI(), 
        refreshCriticalCount()
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
        'completed': 'Transaction Complete'
    };
    return statusNames[status] || status;
}

// Render table view
function renderTableView(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => {
        const slaLevel = transaction.agingLevel || 'normal';
        const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);
        return `
        <tr>
            <td><a href="${sharePointURL}" target="_blank" class="transaction-link" title="Open in SharePoint">${transaction.transactionName}</a></td>
            <td>${transaction.currentStage}</td>
            <td>${transaction.currentPIC}</td>
            <td><span class="status-badge status-${transaction.status}">${getStatusDisplayName(transaction.status)}</span></td>
            <td><span class="aging-indicator aging-${slaLevel}">${transaction.agingDays} days (${transaction.transactionType})</span></td>
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
        return `
        <div class="transaction-card">
            <div class="card-header">
                <div class="card-id"><a href="${sharePointURL}" target="_blank" class="transaction-link">${transaction.transactionName}</a></div>
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

// View transaction details
function viewTransactionDetails(transactionId) {
    const transaction = currentTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const slaLevel = transaction.agingLevel || 'normal';
    const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);
    
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
