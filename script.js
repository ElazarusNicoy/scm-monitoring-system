// SLA Rules for different transaction types
const SLA_RULES = {
    'RCP': { normal: 14, warning: 20, critical: 21 },
    'PR': { normal: 14, warning: 20, critical: 21 },
    'MAS': { normal: 4, warning: 10, critical: 11 },
    'POACR': { normal: 4, warning: 10, critical: 11 },
    'WOAF': { normal: 4, warning: 10, critical: 11 }
};

// Workflow routes for each transaction type
const WORKFLOW_ROUTES = {
    'RCP': [
        'Requestor',
        'Check By',
        'Confirm By',
        'Note By',
        'Initial Approver',
        'Final Approver',
        'Senior Accounting',
        'Finance',
        'VOP Processing',
        'Payment Processing',
        'Request Transaction Completed'
    ],
    'PR': [
        'Requestor',
        'Department Approver 1',
        'Department Approver 2',
        'Department Approver 3',
        'Request For Quotation',
        'Budget Checking',
        'Budget Approver 1',
        'Budget Approver 2',
        'Purchase Order Issuance',
        'Request Transaction Completed'
    ],
    'MAS': [
        'Requestor',
        'Check By',
        'Department Manager Approver',
        'Stockroom Warehouse Owner',
        'Inventory Control',
        'Inventory Control Manager Approver',
        'Cost Accounting',
        'Encode By',
        'Request Transaction Completed'
    ],
    'POACR': [
        'Requestor',
        'Superior of the Requestor',
        'SCM Managers Approver',
        'VP Operation',
        'EVP COO',
        'Encode By',
        'Request Transaction Completed'
    ],
    'WOAF': [
        'Requestor',
        'QC Approver',
        'BBA Approver',
        'PPC Approver',
        'Encode By',
        'Request Transaction Completed'
    ]
};

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

// // Sample transaction data
// const sampleTransactions = [
//     {
//         id: 'TXN-2024-001',
//         transactionName: 'P2-03-12345',
//         transactionType: 'RCP',
//         currentStage: 'Initial Approver',
//         currentPIC: 'John Smith',
//         status: 'for-approval',
//         agingDays: 2,
//         submittedDate: '2024-02-28',
//         lastUpdated: '2024-03-01',
//         requestor: 'Jane Doe'
//     },
//     {
//         id: 'TXN-2024-002',
//         transactionName: 'PR-12346',
//         transactionType: 'PR',
//         currentStage: 'Budget Approver 1',
//         currentPIC: 'Sarah Williams',
//         status: 'pending',
//         agingDays: 16,
//         submittedDate: '2024-02-14',
//         lastUpdated: '2024-02-29',
//         requestor: 'Tom Brown'
//     },
//     {
//         id: 'TXN-2024-003',
//         transactionName: 'MAS2026-03-03-224500',
//         transactionType: 'MAS',
//         currentStage: 'Cost Accounting',
//         currentPIC: 'David Lee',
//         status: 'for-additional-input',
//         agingDays: 12,
//         submittedDate: '2024-02-18',
//         lastUpdated: '2024-03-01',
//         requestor: 'Alice Chen'
//     },
//     {
//         id: 'TXN-2024-004',
//         transactionName: 'PR-12347',
//         transactionType: 'PR',
//         currentStage: 'Request Transaction Completed',
//         currentPIC: 'System',
//         status: 'completed',
//         agingDays: 15,
//         submittedDate: '2024-02-10',
//         lastUpdated: '2024-02-25',
//         requestor: 'Mark Taylor'
//     },
//     {
//         id: 'TXN-2024-005',
//         transactionName: 'P5-03-12346',
//         transactionType: 'RCP',
//         currentStage: 'Requestor',
//         currentPIC: 'Peter Garcia',
//         status: 'for-approval',
//         agingDays: 1,
//         submittedDate: '2024-03-01',
//         lastUpdated: '2024-03-01',
//         requestor: 'Peter Garcia'
//     },
//     {
//         id: 'TXN-2024-006',
//         transactionName: '24500',
//         transactionType: 'POACR',
//         currentStage: 'SCM Managers Approver',
//         currentPIC: 'Rachel Green',
//         status: 'pending',
//         agingDays: 6,
//         submittedDate: '2024-02-24',
//         lastUpdated: '2024-03-01',
//         requestor: 'Quinn Roberts'
//     },
//     {
//         id: 'TXN-2024-007',
//         transactionName: 'WOEF2026-03-03-224500',
//         transactionType: 'WOAF',
//         currentStage: 'BBA Approver',
//         currentPIC: 'Steven King',
//         status: 'for-additional-input',
//         agingDays: 4,
//         submittedDate: '2024-02-26',
//         lastUpdated: '2024-03-01',
//         requestor: 'Tina Moore'
//     },
//     {
//         id: 'TXN-2024-008',
//         transactionName: 'P6-02-12348',
//         transactionType: 'RCP',
//         currentStage: 'Payment Processing',
//         currentPIC: 'Victor Chen',
//         status: 'for-approval',
//         agingDays: 22,
//         submittedDate: '2024-02-08',
//         lastUpdated: '2024-03-02',
//         requestor: 'Wendy Liu'
//     }
// ];

// // State management
// let currentTransactions = [...sampleTransactions];
// let filteredTransactions = [...sampleTransactions];
// let currentPage = 1;
// const itemsPerPage = 10;
// let currentView = 'table';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadTransactionsFromAPI(); // Load from database first
    setupEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

// Load transactions from MySQL via API
async function loadTransactionsFromAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/transactions');
        const data = await response.json();

        if (XPathResult.success) {
            console.log(`Loaded ${result.count} transactions from database`)
            return result.data.map(transaction => ({
                // Map your database columns to the format your dashboard expects
                transactionId: transaction.transactionNumber || 'N/A',
                type: transaction.source || 'Unknown',
                status: transaction.currentFormStatus || 'Pending',
                priority: 'Medium', // You can add priority logic here
                assignedTo: transaction.currentApproverPIC || 'Unassigned',
                lastUpdated: transaction.lastModifiedDate || transaction.submittedDate || '',
                description: `${transaction.requestor || 'Unknown'} - ${transaction.source || 'Transaction'}`
            }));
        } else {
            console.error('API Errror:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Failed to load data from API:', error);
        // Return empty array if API fails
        return [];
    }
}

// Update your existing functions to use API data
async function initializeDashboard() {
    console.log('Initializing dashboard...');

    // Load data from API instead of using sample data
    const apiData = await loadTransactionsFromAPI

    // If API data is empty, you can fall back to sample data for testing
    const transactionData = apiData.length > 0 ? apiData : [];

    if (transactionData.length === 0) {
        console.warn('No data available from API');
        // Optionally show a message to user
        showNoDataMessage();
        return;
    }

    // Use the API data for your dashboard
    populateDashboard(transactionData);
    updateStatusCounts(transactionData)
    // later on, add other initialization logic here

}

// Update refresh function to reload from API
async function refreshData() {
    console.log('Refreshing data...');
    showLoadingMessage();

    const newData = await loadTransactionsFromAPI();

    if (newData.length > 0) {
        populateDashboard(newData);
        updateStatusCounts(newData);
        hideLoadingMessage();
        console.log('Data refreshed successfully');
    } else {
        console.error('Failed to refresh data');
        hideLoadingMessage();
        showErrorMessage();
    }
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

document.addEventListener('DOMContentLoaded', initializeDashboard)


// Get SLA level based on transaction type and aging days
function getSLALevel(transactionType, agingDays) {
    const rules = SLA_RULES[transactionType] || SLA_RULES['RCP'];
    if (agingDays <= rules.normal) return 'normal';
    if (agingDays <= rules.warning) return 'warning';
    return 'critical';
}

// Update dashboard summary cards
function updateDashboardSummary() {
    const forApprovalCount = currentTransactions.filter(t => t.status === 'for-approval').length;
    const pendingCount = currentTransactions.filter(t => t.status === 'pending').length;
    const additionalInputCount = currentTransactions.filter(t => t.status === 'for-additional-input').length;
    const completedCount = currentTransactions.filter(t => t.status === 'completed').length;
    
    const activeTransactions = currentTransactions.filter(t => t.status !== 'completed');
    const normalCount = activeTransactions.filter(t => getSLALevel(t.transactionType, t.agingDays) === 'normal').length;
    const warningCount = activeTransactions.filter(t => getSLALevel(t.transactionType, t.agingDays) === 'warning').length;
    const criticalCount = activeTransactions.filter(t => getSLALevel(t.transactionType, t.agingDays) === 'critical').length;

    document.getElementById('forApprovalCount').textContent = forApprovalCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('additionalInputCount').textContent = additionalInputCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('normalCount').textContent = normalCount;
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('criticalCount').textContent = criticalCount;
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
            const slaLevel = getSLALevel(transaction.transactionType, transaction.agingDays);
            matchesAging = slaLevel === agingFilter;
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
    
    // Reload from API
    loadTransactionsFromAPI().then(() => {
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
        const slaLevel = getSLALevel(transaction.transactionType, transaction.agingDays);
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
        const slaLevel = getSLALevel(transaction.transactionType, transaction.agingDays);
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

    const slaLevel = getSLALevel(transaction.transactionType, transaction.agingDays);
    const slaRules = SLA_RULES[transaction.transactionType];
    const sharePointURL = getSharePointURL(transaction.transactionType, transaction.transactionName);
    const workflowRoute = WORKFLOW_ROUTES[transaction.transactionType];
    const currentStageIndex = workflowRoute.indexOf(transaction.currentStage);
    
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
            <h3><i class="fas fa-clock"></i> SLA Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Normal SLA</span>
                    <span class="detail-value">≤ ${slaRules.normal} days</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Warning SLA</span>
                    <span class="detail-value">${slaRules.normal + 1} - ${slaRules.warning} days</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Critical SLA</span>
                    <span class="detail-value">≥ ${slaRules.critical} days</span>
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
            <h3><i class="fas fa-project-diagram"></i> Workflow Progress</h3>
            <div class="workflow-timeline">
                ${workflowRoute.map((stage, index) => {
                    let status = 'pending';
                    if (index < currentStageIndex) status = 'completed';
                    else if (index === currentStageIndex) status = 'current';
                    
                    return `
                    <div class="timeline-item">
                        <div class="timeline-marker ${status}"></div>
                        <div class="timeline-content">
                            <div class="timeline-stage">
                                ${stage}
                                ${status === 'completed' ? '<i class="fas fa-check-circle" style="color: var(--success-color); margin-left: 0.5rem;"></i>' : ''}
                                ${status === 'current' ? '<i class="fas fa-spinner" style="color: var(--warning-color); margin-left: 0.5rem;"></i>' : ''}
                            </div>
                            <div class="timeline-date">
                                ${status === 'completed' ? 'Completed' : status === 'current' ? 'In Progress' : 'Pending'}
                            </div>
                        </div>
                    </div>
                `}).join('')}
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
