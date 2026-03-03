// Sample transaction data
const sampleTransactions = [
    {
        id: 'TXN-2024-001',
        poNumber: 'PO-45678',
        vendor: 'ABC Suppliers Inc.',
        amount: 125000.00,
        currentStage: 'Approval',
        status: 'active',
        agingDays: 2,
        priority: 'medium',
        submittedDate: '2024-02-28',
        lastUpdated: '2024-03-01',
        approver: 'John Smith',
        description: 'Office supplies procurement',
        workflow: [
            { stage: 'Submission', date: '2024-02-28', status: 'completed', user: 'Jane Doe' },
            { stage: 'Review', date: '2024-02-29', status: 'completed', user: 'Mike Johnson' },
            { stage: 'Approval', date: '2024-03-01', status: 'current', user: 'John Smith' },
            { stage: 'Processing', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-002',
        poNumber: 'PO-45679',
        vendor: 'XYZ Technologies',
        amount: 450000.00,
        currentStage: 'Review',
        status: 'active',
        agingDays: 5,
        priority: 'high',
        submittedDate: '2024-02-25',
        lastUpdated: '2024-02-29',
        approver: 'Sarah Williams',
        description: 'IT equipment purchase',
        workflow: [
            { stage: 'Submission', date: '2024-02-25', status: 'completed', user: 'Tom Brown' },
            { stage: 'Review', date: '2024-02-29', status: 'current', user: 'Sarah Williams' },
            { stage: 'Approval', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Processing', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-003',
        poNumber: 'PO-45680',
        vendor: 'Global Logistics Ltd.',
        amount: 89500.00,
        currentStage: 'Processing',
        status: 'active',
        agingDays: 9,
        priority: 'high',
        submittedDate: '2024-02-20',
        lastUpdated: '2024-03-01',
        approver: 'David Lee',
        description: 'Shipping and logistics services',
        workflow: [
            { stage: 'Submission', date: '2024-02-20', status: 'completed', user: 'Alice Chen' },
            { stage: 'Review', date: '2024-02-22', status: 'completed', user: 'Bob Wilson' },
            { stage: 'Approval', date: '2024-02-26', status: 'completed', user: 'David Lee' },
            { stage: 'Processing', date: '2024-03-01', status: 'current', user: 'Emma Davis' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-004',
        poNumber: 'PO-45681',
        vendor: 'Premium Office Furniture',
        amount: 215000.00,
        currentStage: 'Completed',
        status: 'completed',
        agingDays: 15,
        priority: 'low',
        submittedDate: '2024-02-10',
        lastUpdated: '2024-02-25',
        approver: 'Lisa Anderson',
        description: 'Office furniture for new branch',
        workflow: [
            { stage: 'Submission', date: '2024-02-10', status: 'completed', user: 'Mark Taylor' },
            { stage: 'Review', date: '2024-02-12', status: 'completed', user: 'Nancy White' },
            { stage: 'Approval', date: '2024-02-15', status: 'completed', user: 'Lisa Anderson' },
            { stage: 'Processing', date: '2024-02-20', status: 'completed', user: 'Oscar Martinez' },
            { stage: 'Completed', date: '2024-02-25', status: 'completed', user: 'System' }
        ]
    },
    {
        id: 'TXN-2024-005',
        poNumber: 'PO-45682',
        vendor: 'Tech Solutions Pro',
        amount: 675000.00,
        currentStage: 'Submission',
        status: 'pending',
        agingDays: 1,
        priority: 'medium',
        submittedDate: '2024-03-01',
        lastUpdated: '2024-03-01',
        approver: 'Pending Assignment',
        description: 'Software licensing renewal',
        workflow: [
            { stage: 'Submission', date: '2024-03-01', status: 'current', user: 'Peter Garcia' },
            { stage: 'Review', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Approval', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Processing', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-006',
        poNumber: 'PO-45683',
        vendor: 'Industrial Supplies Co.',
        amount: 340000.00,
        currentStage: 'Review',
        status: 'active',
        agingDays: 6,
        priority: 'high',
        submittedDate: '2024-02-24',
        lastUpdated: '2024-03-01',
        approver: 'Rachel Green',
        description: 'Manufacturing materials',
        workflow: [
            { stage: 'Submission', date: '2024-02-24', status: 'completed', user: 'Quinn Roberts' },
            { stage: 'Review', date: '2024-03-01', status: 'current', user: 'Rachel Green' },
            { stage: 'Approval', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Processing', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-007',
        poNumber: 'PO-45684',
        vendor: 'Marketing Solutions Inc.',
        amount: 95000.00,
        currentStage: 'Approval',
        status: 'rejected',
        agingDays: 4,
        priority: 'low',
        submittedDate: '2024-02-26',
        lastUpdated: '2024-03-01',
        approver: 'Steven King',
        description: 'Marketing campaign materials',
        workflow: [
            { stage: 'Submission', date: '2024-02-26', status: 'completed', user: 'Tina Moore' },
            { stage: 'Review', date: '2024-02-28', status: 'completed', user: 'Uma Patel' },
            { stage: 'Approval', date: '2024-03-01', status: 'rejected', user: 'Steven King' },
            { stage: 'Processing', date: null, status: 'pending', user: 'TBD' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    },
    {
        id: 'TXN-2024-008',
        poNumber: 'PO-45685',
        vendor: 'Energy Systems Ltd.',
        amount: 520000.00,
        currentStage: 'Processing',
        status: 'active',
        agingDays: 3,
        priority: 'medium',
        submittedDate: '2024-02-27',
        lastUpdated: '2024-03-02',
        approver: 'Victor Chen',
        description: 'Power backup systems',
        workflow: [
            { stage: 'Submission', date: '2024-02-27', status: 'completed', user: 'Wendy Liu' },
            { stage: 'Review', date: '2024-02-28', status: 'completed', user: 'Xavier Ross' },
            { stage: 'Approval', date: '2024-03-01', status: 'completed', user: 'Victor Chen' },
            { stage: 'Processing', date: '2024-03-02', status: 'current', user: 'Yolanda Martinez' },
            { stage: 'Completed', date: null, status: 'pending', user: 'TBD' }
        ]
    }
];

// State management
let currentTransactions = [...sampleTransactions];
let filteredTransactions = [...sampleTransactions];
let currentPage = 1;
const itemsPerPage = 10;
let currentView = 'table';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateDashboardSummary();
    renderTransactions();
    setupEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

// Update dashboard summary cards
function updateDashboardSummary() {
    const activeCount = currentTransactions.filter(t => t.status === 'active').length;
    const completedCount = currentTransactions.filter(t => t.status === 'completed').length;
    const agingCount = currentTransactions.filter(t => t.agingDays >= 4 && t.status !== 'completed').length;
    const criticalCount = currentTransactions.filter(t => t.agingDays >= 8 && t.status !== 'completed').length;

    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('agingCount').textContent = agingCount;
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
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Filter dropdowns
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('agingFilter').addEventListener('change', applyFilters);
    document.getElementById('stageFilter').addEventListener('change', applyFilters);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    
    // Modal close
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
        // Search filter
        const matchesSearch = searchTerm === '' || 
            transaction.id.toLowerCase().includes(searchTerm) ||
            transaction.vendor.toLowerCase().includes(searchTerm) ||
            transaction.poNumber.toLowerCase().includes(searchTerm);

        // Status filter
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

        // Aging filter
        let matchesAging = true;
        if (agingFilter === 'normal') matchesAging = transaction.agingDays <= 3;
        else if (agingFilter === 'warning') matchesAging = transaction.agingDays >= 4 && transaction.agingDays <= 7;
        else if (agingFilter === 'critical') matchesAging = transaction.agingDays >= 8;

        // Stage filter
        const matchesStage = stageFilter === 'all' || transaction.currentStage.toLowerCase() === stageFilter.toLowerCase();

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
    
    setTimeout(() => {
        // Simulate data refresh
        currentTransactions = [...sampleTransactions];
        applyFilters();
        updateDashboardSummary();
        icon.style.animation = '';
    }, 1000);
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

// Render table view
function renderTableView(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td><strong>${transaction.id}</strong></td>
            <td>${transaction.poNumber}</td>
            <td>${transaction.vendor}</td>
            <td>$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td>${transaction.currentStage}</td>
            <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
            <td><span class="aging-indicator aging-${getAgingClass(transaction.agingDays)}">${transaction.agingDays} days</span></td>
            <td><span class="priority-badge priority-${transaction.priority}">
                <i class="fas fa-${getPriorityIcon(transaction.priority)}"></i> ${transaction.priority}
            </span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaction.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render card view
function renderCardView(transactions) {
    const container = document.getElementById('cardView');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">No transactions found</p>';
        return;
    }

    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-card">
            <div class="card-header">
                <div class="card-id">${transaction.id}</div>
                <span class="status-badge status-${transaction.status}">${transaction.status}</span>
            </div>
            <div class="card-body">
                <div class="card-row">
                    <span class="card-label">PO Number:</span>
                    <span class="card-value">${transaction.poNumber}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Vendor:</span>
                    <span class="card-value">${transaction.vendor}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Amount:</span>
                    <span class="card-value">$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Current Stage:</span>
                    <span class="card-value">${transaction.currentStage}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Aging:</span>
                    <span class="aging-indicator aging-${getAgingClass(transaction.agingDays)}">${transaction.agingDays} days</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Priority:</span>
                    <span class="priority-badge priority-${transaction.priority}">
                        <i class="fas fa-${getPriorityIcon(transaction.priority)}"></i> ${transaction.priority}
                    </span>
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
    `).join('');
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

    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Transaction Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value">${transaction.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">PO Number</span>
                    <span class="detail-value">${transaction.poNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vendor</span>
                    <span class="detail-value">${transaction.vendor}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value"><span class="status-badge status-${transaction.status}">${transaction.status}</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority</span>
                    <span class="detail-value"><span class="priority-badge priority-${transaction.priority}">
                        <i class="fas fa-${getPriorityIcon(transaction.priority)}"></i> ${transaction.priority}
                    </span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Aging</span>
                    <span class="detail-value"><span class="aging-indicator aging-${getAgingClass(transaction.agingDays)}">${transaction.agingDays} days</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Current Approver</span>
                    <span class="detail-value">${transaction.approver}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${transaction.description}</span>
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
                ${transaction.workflow.map(stage => `
                    <div class="timeline-item">
                        <div class="timeline-marker ${stage.status}"></div>
                        <div class="timeline-content">
                            <div class="timeline-stage">
                                <i class="fas fa-${getStageIcon(stage.stage)}"></i> ${stage.stage}
                                ${stage.status === 'completed' ? '<i class="fas fa-check-circle" style="color: var(--success-color); margin-left: 0.5rem;"></i>' : ''}
                                ${stage.status === 'current' ? '<i class="fas fa-spinner" style="color: var(--warning-color); margin-left: 0.5rem;"></i>' : ''}
                                ${stage.status === 'rejected' ? '<i class="fas fa-times-circle" style="color: var(--danger-color); margin-left: 0.5rem;"></i>' : ''}
                            </div>
                            <div class="timeline-date">
                                ${stage.date ? `Completed: ${stage.date}` : 'Pending'}
                                ${stage.user ? ` | User: ${stage.user}` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('transactionModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

// Helper functions
function getAgingClass(days) {
    if (days <= 3) return 'normal';
    if (days <= 7) return 'warning';
    return 'critical';
}

function getPriorityIcon(priority) {
    const icons = {
        low: 'arrow-down',
        medium: 'minus',
        high: 'arrow-up'
    };
    return icons[priority] || 'minus';
}

function getStageIcon(stage) {
    const icons = {
        'Submission': 'file-upload',
        'Review': 'search',
        'Approval': 'check-square',
        'Processing': 'cog',
        'Completed': 'check-circle'
    };
    return icons[stage] || 'circle';
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
