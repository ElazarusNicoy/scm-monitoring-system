let allEscalationTransactions = [];
let filteredEscalationTransactions = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentView = 'table';

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setupEventListeners();
    loadEscalationData();
    checkAutoEscalation(); // ✅ trigger auto email check on page load
    setInterval(loadEscalationData, 30000); // auto-refresh every 30s
});

function updateCurrentTime() {
    const now = new Date();
    const el = document.getElementById('currentTime');
    if (el) el.textContent = now.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

// ─── Load Escalation Transactions ─────────────────────────────
async function loadEscalationData() {
    try {
        const [transRes, stageRes, typeRes, picRes] = await Promise.all([
            fetch('http://localhost:5000/api/escalation-transactions'),
            fetch('http://localhost:5000/api/distinct-stages'),
            fetch('http://localhost:5000/api/distinct-transaction-types'),
            fetch('http://localhost:5000/api/distinct-current-pics')
        ]);

        const transData = await transRes.json();
        const stageData = await stageRes.json();
        const typeData  = await typeRes.json();
        const picData   = await picRes.json();

        if (transData.success) {
            allEscalationTransactions = transData.escalationTransactions.map(t => ({
                transactionName:  t['transactionNumber']  || 'N/A',
                transactionType:  t['transactionType']    || 'N/A',
                requestor:        t['requestor']          || 'N/A',
                currentStage:     t['currentStage']       || 'N/A',
                currentPIC:       t['currentPIC']         || 'N/A',
                currentPICEmail:  t['currentPICEmail']    || '',
                requestorEmail:   t['requestorEmail']     || '',
                status:           (t['status'] || 'pending').toLowerCase().trim().replace(/\s+/g, '-'),
                agingDays:        t['agingDays']          || 0,
                agingLevel:       (t['agingLevel'] || 'warning').toLowerCase().trim(),
                submittedDate:    t['submittedDate']      || 'N/A',
                lastUpdated:      t['lastUpdated']        || 'N/A',
                sharePointLink:   t['sharePointLink']     || '#'
            }));

            filteredEscalationTransactions = [...allEscalationTransactions];
            updateSummaryCards();
            applyFilters();
        }

        if (stageData.success) populateSelect('stageFilter', stageData.distinctStages);
        if (typeData.success)  populateSelect('transactionTypeFilter', typeData.distinctTransactionTypes);
        if (picData.success)   populateSelect('currentPICFilter', picData.distinctCurrentPICs);

    } catch (error) {
        console.error('Error loading escalation data:', error);
    }
}

function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select) return;
    // clear existing dynamic options first
    Array.from(select.options).forEach(opt => {
        if (opt.value !== 'all') opt.remove();
    });
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.toLowerCase().replace(/\s+/g, '-');
        option.textContent = item;
        select.appendChild(option);
    });
}

// ─── Summary Cards ────────────────────────────────────────────
function updateSummaryCards() {
    const warningCount  = allEscalationTransactions.filter(t => t.agingLevel === 'warning').length;
    const criticalCount = allEscalationTransactions.filter(t => t.agingLevel === 'critical').length;

    document.getElementById('newlyWarningCount').textContent  = warningCount;
    document.getElementById('newlyCriticalCount').textContent = criticalCount;
}

// ─── Auto Escalation Check ────────────────────────────────────
async function checkAutoEscalation() {
    try {
        const res = await fetch('http://localhost:5000/api/check-auto-escalation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success && data.autoEmailsSent > 0) {
            console.log(`✅ Auto escalation: ${data.autoEmailsSent} email(s) sent.`);
            showNotification(
                `${data.autoEmailsSent} automated escalation email(s) dispatched.`,
                'info'
            );
        }
    } catch (error) {
        console.warn('Auto escalation check failed:', error.message);
    }
}

// ─── Manual Follow Up Email ───────────────────────────────────
async function sendFollowUpEmail(transaction) {
    const btn = document.querySelector(`[data-followup="${transaction.transactionName}"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    try {
        const res = await fetch('http://localhost:5000/api/send-followup-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionName:  transaction.transactionName,
                transactionType:  transaction.transactionType,
                agingDays:        transaction.agingDays,
                agingLevel:       transaction.agingLevel,
                currentPIC:       transaction.currentPIC,
                requestor:        transaction.requestor,
                currentPICEmail:  transaction.currentPICEmail,
                requestorEmail:   transaction.requestorEmail,
                sharePointLink:   transaction.sharePointLink,
                sentBy:           'USER'
            })
        });

        const data = await res.json();

        if (data.success) {
            showNotification(
                `✅ Follow-up email sent to ${transaction.currentPIC}.`,
                'success'
            );
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Sent';
                btn.classList.add('btn-sent');
            }
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Follow-up email failed:', error);
        showNotification(`❌ Failed to send email: ${error.message}`, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-envelope"></i> Follow Up';
        }
    }
}

// ─── Apply Filters ────────────────────────────────────────────
function applyFilters() {
    const searchTerm  = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const agingFilter  = document.getElementById('agingFilter').value;
    const stageFilter  = document.getElementById('stageFilter').value;
    const typeFilter   = document.getElementById('transactionTypeFilter').value;
    const picFilter    = document.getElementById('currentPICFilter').value;

    // Sync summary card active state
    document.querySelectorAll('.summary-card[data-filter-type]').forEach(card => {
        const isActive = card.dataset.filterType === 'aging' &&
                         agingFilter === card.dataset.filterValue;
        card.classList.toggle('card-active', isActive);
    });

    filteredEscalationTransactions = allEscalationTransactions.filter(t => {
        const matchesSearch = searchTerm === '' ||
            t.transactionName.toLowerCase().includes(searchTerm) ||
            t.currentStage.toLowerCase().includes(searchTerm) ||
            t.currentPIC.toLowerCase().includes(searchTerm) ||
            t.requestor.toLowerCase().includes(searchTerm) ||
            t.transactionType.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesAging  = agingFilter  === 'all' || t.agingLevel === agingFilter;

        const normalizedStage = t.currentStage.toLowerCase().replace(/\s+/g, '-');
        const normalizedType  = t.transactionType.toLowerCase().replace(/\s+/g, '-');
        const normalizedPIC   = t.currentPIC.toLowerCase().replace(/\s+/g, '-');

        const matchesStage = stageFilter === 'all' || normalizedStage === stageFilter;
        const matchesType  = typeFilter  === 'all' || normalizedType  === typeFilter;
        const matchesPIC   = picFilter   === 'all' || normalizedPIC   === picFilter;

        return matchesSearch && matchesStatus && matchesAging
             && matchesStage && matchesType && matchesPIC;
    });

    currentPage = 1;
    renderTransactions();
    updateTransactionCountMetric();
}

// ─── Render Transactions ──────────────────────────────────────
function renderTransactions() {
    const start = (currentPage - 1) * itemsPerPage;
    const end   = start + itemsPerPage;
    const paged = filteredEscalationTransactions.slice(start, end);

    if (currentView === 'table') renderTableView(paged);
    else renderCardView(paged);

    updatePagination();
}

function renderTableView(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
                No Warning or Critical transactions found.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>${t.transactionName}</strong><br>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${t.transactionType}</span>
            </td>
            <td>${t.currentStage}</td>
            <td>${t.currentPIC}<br>
                <span style="font-size:0.78rem; color:var(--text-secondary);">${t.currentPICEmail || '—'}</span>
            </td>
            <td><span class="status-badge status-${t.status}">${getStatusDisplayName(t.status)}</span></td>
            <td>
                <strong>${t.agingDays} days</strong><br>
                <span class="aging-indicator aging-${t.agingLevel}">${t.agingLevel.toUpperCase()}</span>
            </td>
            <td>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <button class="btn-action btn-view"
                        onclick='openTransactionModal(${JSON.stringify(t)})'>
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action btn-followup"
                        data-followup="${t.transactionName}"
                        onclick='sendFollowUpEmail(${JSON.stringify(t)})'>
                        <i class="fas fa-envelope"></i> Follow Up
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCardView(transactions) {
    const container = document.getElementById('cardView');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--text-secondary); width:100%;">
                <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
                No Warning or Critical transactions found.
            </div>`;
        return;
    }

    container.innerHTML = transactions.map(t => `
        <div class="transaction-card aging-border-${t.agingLevel}">
            <div class="card-top">
                <span class="card-transaction-name">${t.transactionName}</span>
                <span class="aging-indicator aging-${t.agingLevel}">${t.agingLevel.toUpperCase()}</span>
            </div>
            <div class="card-details">
                <div><span>Type:</span> ${t.transactionType}</div>
                <div><span>Requestor:</span> ${t.requestor}</div>
                <div><span>Current PIC:</span> ${t.currentPIC}</div>
                <div><span>Stage:</span> ${t.currentStage}</div>
                <div><span>Aging:</span> <strong>${t.agingDays} days</strong></div>
                <div><span>Status:</span>
                    <span class="status-badge status-${t.status}">${getStatusDisplayName(t.status)}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-view"
                    onclick='openTransactionModal(${JSON.stringify(t)})'>
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-action btn-followup"
                    data-followup="${t.transactionName}"
                    onclick='sendFollowUpEmail(${JSON.stringify(t)})'>
                    <i class="fas fa-envelope"></i> Follow Up
                </button>
            </div>
        </div>
    `).join('');
}

// ─── Pagination ───────────────────────────────────────────────
function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(filteredEscalationTransactions.length / itemsPerPage));
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent  = totalPages;
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredEscalationTransactions.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + direction), totalPages);
    renderTransactions();
}

// ─── Metric ───────────────────────────────────────────────────
function updateTransactionCountMetric() {
    const shownEl = document.getElementById('shownTransactionCount');
    const totalEl = document.getElementById('totalTransactionCount');
    if (shownEl) shownEl.textContent = filteredEscalationTransactions.length;
    if (totalEl) totalEl.textContent = allEscalationTransactions.length;
}

// ─── Modal ────────────────────────────────────────────────────
function openTransactionModal(transaction) {
    // reuse same modal structure from workflow-tracking
    const modal = document.getElementById('transactionModal');
    const body  = document.getElementById('modalBody');

    body.innerHTML = `
        <div class="modal-details-grid">
            <div class="detail-item">
                <label>Transaction Name</label>
                <span>${transaction.transactionName}</span>
            </div>
            <div class="detail-item">
                <label>Transaction Type</label>
                <span>${transaction.transactionType}</span>
            </div>
            <div class="detail-item">
                <label>Requestor</label>
                <span>${transaction.requestor}</span>
            </div>
            <div class="detail-item">
                <label>Current Stage</label>
                <span>${transaction.currentStage}</span>
            </div>
            <div class="detail-item">
                <label>Current PIC</label>
                <span>${transaction.currentPIC}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span class="status-badge status-${transaction.status}">
                    ${getStatusDisplayName(transaction.status)}
                </span>
            </div>
            <div class="detail-item">
                <label>Aging</label>
                <span>
                    <strong>${transaction.agingDays} days</strong>
                    <span class="aging-indicator aging-${transaction.agingLevel}">
                        ${transaction.agingLevel.toUpperCase()}
                    </span>
                </span>
            </div>
            <div class="detail-item">
                <label>Submitted Date</label>
                <span>${transaction.submittedDate}</span>
            </div>
            <div class="detail-item">
                <label>Last Updated</label>
                <span>${transaction.lastUpdated}</span>
            </div>
            <div class="detail-item">
                <label>SharePoint Link</label>
                <a href="${transaction.sharePointLink}" target="_blank" class="sharepoint-link">
                    <i class="fas fa-external-link-alt"></i> Open Transaction
                </a>
            </div>
        </div>`;

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

// ─── Toast Notification ───────────────────────────────────────
function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error:   '#ef4444',
        info:    '#3b82f6'
    };
    const icons = {
        success: 'fa-check-circle',
        error:   'fa-times-circle',
        info:    'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
        background: white; border-left: 4px solid ${colors[type]};
        border-radius: 8px; padding: 1rem 1.25rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex; align-items: center; gap: 0.75rem;
        max-width: 380px; font-size: 0.9rem;
        animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color:${colors[type]}; font-size:1.2rem;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// ─── Helpers ─────────────────────────────────────────────────
function getStatusDisplayName(status) {
    const map = {
        'for-approval':          'For Approval',
        'pending':                'Pending',
        'for-additional-input':  'For Additional Input',
        'transaction-completed': 'Transaction Completed'
    };
    return map[status] || status;
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.getElementById('tableView').classList.toggle('hidden', view !== 'table');
    document.getElementById('cardView').classList.toggle('hidden', view !== 'card');
    renderTransactions();
}

// ─── Event Listeners ──────────────────────────────────────────
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('agingFilter').addEventListener('change', applyFilters);
    document.getElementById('stageFilter').addEventListener('change', applyFilters);
    document.getElementById('transactionTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('currentPICFilter').addEventListener('change', applyFilters);
    document.getElementById('refreshBtn').addEventListener('click', () => loadEscalationData());

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () { switchView(this.dataset.view); });
    });

    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('transactionModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Summary card click filter
    document.querySelectorAll('.summary-card[data-filter-type]').forEach(card => {
        card.addEventListener('click', function () {
            const filterValue    = this.dataset.filterValue;
            const isAlreadyActive = this.classList.contains('card-active');

            document.querySelectorAll('.summary-card').forEach(c => c.classList.remove('card-active'));

            if (isAlreadyActive) {
                document.getElementById('agingFilter').value = 'all';
            } else {
                this.classList.add('card-active');
                document.getElementById('agingFilter').value = filterValue;
            }

            document.querySelector('.transactions-section')
                    .scrollIntoView({ behavior: 'smooth' });
            applyFilters();
        });
    });
}