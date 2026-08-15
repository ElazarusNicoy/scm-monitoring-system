let allEscalationTransactions = [];
let filteredEscalationTransactions = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentView = 'table';
let escalationTxIndex = new Map();

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setupEventListeners();
    loadEscalationData();
    checkAndSimulateAutoEmails();
    // checkAutoEscalation(); // trigger auto email check on page load
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

function makeTxKey(t) {
    return `${t.transactionName}|${t.transactionType}|${t.currentStage}|${t.currentPIC}`;
}

// ─── Load Data ─────────────────────────────
async function loadEscalationData() {
    try {
        const [transRes, stageRes, typeRes, picRes] = await Promise.all([
            fetch('http://localhost:5000/api/escalation-transactions'),
            fetch('http://localhost:5000/api/distinct-stages'),
            fetch('http://localhost:5000/api/distinct-transaction-types'),
            fetch('http://localhost:5000/api/distinct-current-pics-warning-critical')
        ]);

        const transData = await transRes.json();
        const stageData = await stageRes.json();
        const typeData  = await typeRes.json();
        const picDataWarningCrit   = await picRes.json();

        if (transData.success) {
            // Same mapping pattern as workflow-tracking script.js
            allEscalationTransactions = transData.escalationTransactions.map(t => ({
                transactionName: t['Transaction Name'] || 'N/A',
                transactionType: t['Transaction Type'] || 'N/A',
                requestor:       t['Requestor']        || 'N/A',
                currentStage:    t['Current Stage']    || 'N/A',
                currentPIC:      t['Current PIC']      || 'N/A',
                currentPICEmail: t['Current PIC Email']|| '',
                requestorEmail:  t['Requestor Email']  || '',
                status:          (t['Status'] || 'pending').toLowerCase().trim().replace(/\s+/g, '-'),
                agingDays:       t['Aging (Days)']     || 0,
                agingLevel:      (t['SLA Status'] || 'warning').toLowerCase().trim(),
                submittedDate:   t['Submitted Date']   || 'N/A',
                lastUpdated:     t['Last Updated']     || 'N/A',
                sharePointLink:  t['SharePoint Link']  || '#'
            }));

            escalationTxIndex = new Map(
                allEscalationTransactions.map(t => [makeTxKey(t), t])
            );

            filteredEscalationTransactions = [...allEscalationTransactions];
            updateSummaryCards();
            applyFilters();
        }

        if (stageData.success) populateSelect('stageFilter', stageData.distinctStages);
        if (typeData.success)  populateSelect('transactionTypeFilter', typeData.distinctTransactionTypes);
        if (picDataWarningCrit.success) populateSelect('currentPICFilter', picDataWarningCrit.distinctCurrentPICsWarningCrit);

    } catch (error) {
        console.error('Error loading escalation data:', error);
    }
}

// ─── Auto Email Simulation ────────────────────────────────────
async function checkAndSimulateAutoEmails() {
    try {
        console.log('Checking for newly aged transactions...');
        
        const response = await fetch('http://localhost:5000/api/newly-aged-transactions');
        const data = await response.json();

        if (!data.success) {
            console.error('Failed to fetch newly aged transactions:', data.error);
            return;
        }

        const newlyAged = data.newlyAgedTransactions || [];
        console.log(`Found ${newlyAged.length} newly aged transaction(s)`);

        if (newlyAged.length === 0) {
            console.log('No newly aged transactions requiring auto-follow-up.');
            return;
        }

        // Map the data to match our transaction format
        const transactions = newlyAged.map(t => ({
            transactionName: t['Transaction Name'] || 'N/A',
            transactionType: t['Transaction Type'] || 'N/A',
            requestor:       t['Requestor']        || 'N/A',
            currentStage:    t['Current Stage']    || 'N/A',
            currentPIC:      t['Current PIC']      || 'N/A',
            currentPICEmail: t['Current PIC Email']|| '',
            requestorEmail:  t['Requestor Email']  || '',
            status:          (t['Status'] || 'pending').toLowerCase().trim().replace(/\s+/g, '-'),
            agingDays:       t['Aging (Days)']     || 0,
            agingLevel:      (t['SLA Status'] || 'warning').toLowerCase().trim(),
            submittedDate:   t['Submitted Date']   || 'N/A',
            lastUpdated:     t['Last Updated']     || 'N/A',
            sharePointLink:  t['SharePoint Link']  || '#'
        }));

        // Simulate sending emails for each newly aged transaction
        for (const transaction of transactions) {
            await simulateAutoEmail(transaction);
        }

        // Show summary toast notification
        showAutoEmailSummaryToast(transactions);

    } catch (error) {
        console.error('Error in checkAndSimulateAutoEmails:', error);
    }
}

async function simulateAutoEmail(transaction) {
    console.log(`Simulating auto-email for: ${transaction.transactionName} (${transaction.agingLevel.toUpperCase()})`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log to console (simulating email send)
    console.log(`✅ Auto follow-up email simulated:`);
    console.log(`   To: ${transaction.currentPIC} <${transaction.currentPICEmail}>`);
    console.log(`   CC: ${transaction.requestor} <${transaction.requestorEmail}>, System Admin`);
    console.log(`   Subject: ${transaction.agingLevel === 'critical' ? '🔴 URGENT' : '⚠️ ATTENTION REQUIRED'}: Follow-up Required - ${transaction.transactionName}`);
    console.log(`   Aging: ${transaction.agingDays} days (${transaction.agingLevel.toUpperCase()})`);
}

function showAutoEmailSummaryToast(transactions) {
    const warningCount = transactions.filter(t => t.agingLevel === 'warning').length;
    const criticalCount = transactions.filter(t => t.agingLevel === 'critical').length;
    
    let message = '🤖 Automatic Follow-up Emails Sent:\n';
    
    if (criticalCount > 0) {
        message += `• ${criticalCount} Critical transaction${criticalCount > 1 ? 's' : ''}\n`;
    }
    if (warningCount > 0) {
        message += `• ${warningCount} Warning transaction${warningCount > 1 ? 's' : ''}`;
    }
    
    // Create detailed list
    const transactionList = transactions.map(t => 
        `${t.transactionName} (${t.agingLevel.toUpperCase()})`
    ).join(', ');

    // Show main toast
    showToastWithDetails(message, transactionList, 'success');
}

function showToastWithDetails(message, details, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const icons  = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
        background: white; border-left: 4px solid ${colors[type]};
        border-radius: 8px; padding: 1rem 1.25rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex; flex-direction: column; gap: 0.5rem;
        max-width: 450px; font-size: 0.9rem;
        animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas ${icons[type]}" style="color:${colors[type]}; font-size:1.2rem;"></i>
            <div>
                <strong style="display: block; margin-bottom: 0.25rem;">Auto-Escalation System</strong>
                <div style="white-space: pre-line; line-height: 1.4;">${message}</div>
            </div>
        </div>
        ${details ? `
        <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; color: #6c757d; margin-top: 0.5rem;">
            <strong style="display: block; margin-bottom: 0.25rem; color: #495057;">Transactions:</strong>
            ${details}
        </div>` : ''}
        <button onclick="this.parentElement.remove()" 
            style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: #6c757d; cursor: pointer; font-size: 1.2rem; padding: 0.25rem;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 10 seconds for detailed toasts
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 10000);
}

// Add CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

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

    const warningEl  = document.getElementById('warningCount');
    const criticalEl = document.getElementById('criticalCount');

    if (warningEl)  warningEl.textContent  = warningCount;
    if (criticalEl) criticalEl.textContent = criticalCount;
    
}

// ─── Apply Filters ────────────────────────────────────────────
function applyFilters() {
    const search  = document.getElementById('searchInput').value.toLowerCase();
    const aging  = document.getElementById('agingFilter').value;
    const stage  = document.getElementById('stageFilter').value;
    const type   = document.getElementById('transactionTypeFilter').value;
    const pic    = document.getElementById('currentPICFilter').value;

    // Sync card active state
    document.querySelectorAll('.summary-card[data-filter-type]').forEach(card => {
        card.classList.toggle('card-active',
            card.dataset.filterType === 'aging' && aging === card.dataset.filterValue
        );
    });

    filteredEscalationTransactions = allEscalationTransactions.filter(t => {
        const matchesSearch = search === '' ||
            t.transactionName.toLowerCase().includes(search) ||
            t.currentStage.toLowerCase().includes(search) ||
            t.currentPIC.toLowerCase().includes(search) ||
            t.requestor.toLowerCase().includes(search) ||
            t.transactionType.toLowerCase().includes(search);

        const matchesAging  = aging === 'all' || t.agingLevel === aging;
        const matchesStage = stage === 'all' || t.currentStage.toLowerCase().replace(/\s+/g, '-') === stage;
        const matchesType  = type === 'all' || t.transactionType.toLowerCase().replace(/\s+/g, '-') === type;
        const matchesPIC   = pic === 'all' || t.currentPIC.toLowerCase().replace(/\s+/g, '-') === pic;

        return matchesSearch && matchesAging
             && matchesStage && matchesType && matchesPIC;
    });

    currentPage = 1;
    renderTransactions();
    updateMetric();
}

function renderTransactions() {
    const start = (currentPage - 1) * itemsPerPage;
    const paged = filteredEscalationTransactions.slice(start, start + itemsPerPage);
    currentView === 'table' ? renderTableView(paged) : renderCardView(paged);
    updatePagination();
}

function renderTableView(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    No transactions found.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(t => {
        const txKey = makeTxKey(t);
        return `
        <tr>
            <td>
                <strong>${t.transactionName}</strong>
            </td>
            <td>${t.currentStage}</td>
            <td>${t.currentPIC}</td>
            <td>
                <strong>${t.agingDays}</strong> days
                <div>
                    <span class="aging-indicator aging-${t.agingLevel}">
                        ${t.agingLevel.toUpperCase()}
                    </span>
                </div>
            </td>
            <td>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                    <button class="btn-action btn-view"
                        data-action="view"
                        data-key="${txKey}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action btn-followup"
                        data-action="followup"
                        data-key="${txKey}"
                        id="followup-${t.transactionName.replace(/\s+/g, '-')}">
                        <i class="fas fa-envelope"></i> Follow Up
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function renderCardView(transactions) {
    const container = document.getElementById('cardView');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="width:100%;">
                <i class="fas fa-inbox"></i>
                No Warning or Critical transactions found.
            </div>`;
        return;
    }

    container.innerHTML = transactions.map(t => {
        const txKey = makeTxKey(t);
        return `
        <div class="transaction-card">
            <div class="card-top">
                <span class="card-transaction-name">${t.transactionName}</span>
                <span class="aging-indicator aging-${t.agingLevel}">
                    ${t.agingLevel.toUpperCase()}
                </span>
            </div>
            <div class="card-details">
                <div><span>Requestor:</span> ${t.requestor}</div>
                <div><span>Current PIC:</span> ${t.currentPIC}</div>
                <div><span>Stage:</span> ${t.currentStage}</div>
                <div><span>Aging:</span> <strong>${t.agingDays} days</strong></div>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-view"
                    data-action="view"
                    data-key="${txKey}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-action btn-followup"
                    data-action="followup"
                    data-key="${txKey}"
                    id="followup-${t.transactionName.replace(/\s+/g, '-')}">
                    <i class="fas fa-envelope"></i> Follow Up
                </button>
            </div>
        </div>
    `}).join('');
}

// ─── Follow Up Email (Simulated) ──────────────────────────────
async function sendFollowUpEmail(buttonEl, transaction) {
    if (!transaction) {
        showToast('Unable to prepare email: transaction data not found.', 'error');
        return;
    }

    // Show email preview modal
    openEmailPreviewModal(transaction);
}

function openEmailPreviewModal(transaction) {
    const modal = document.getElementById('emailPreviewModal');
    
    // System admin email (you can make this configurable)
    const systemAdminEmail = 'systemadmin@company.com';
    
    // Populate email fields
    const toField = document.getElementById('emailTo');
    const ccField = document.getElementById('emailCc');
    const subjectField = document.getElementById('emailSubject');
    const contentSection = document.getElementById('emailContentSection');
    
    // To: Current PIC
    toField.innerHTML = `
        <span class="email-recipient">
            <i class="fas fa-user"></i> ${transaction.currentPIC} &lt;${transaction.currentPICEmail || 'pic@company.com'}&gt;
        </span>
    `;
    
    // Cc: Requestor and System Admin
    ccField.innerHTML = `
        <span class="email-recipient">
            <i class="fas fa-user"></i> ${transaction.requestor} &lt;${transaction.requestorEmail || 'requestor@company.com'}&gt;
        </span>
        <span class="email-recipient">
            <i class="fas fa-user-shield"></i> System Admin &lt;${systemAdminEmail}&gt;
        </span>
    `;
    
    // Subject
    const urgencyLabel = transaction.agingLevel === 'critical' ? '🔴 URGENT' : '⚠️ ATTENTION REQUIRED';
    subjectField.textContent = `${urgencyLabel}: Follow-up Required - ${transaction.transactionName}`;
    
    // Email content
    const agingBadgeClass = transaction.agingLevel === 'critical' ? 'aging-badge-critical' : 'aging-badge-warning';
    const agingLabel = transaction.agingLevel.toUpperCase();
    
    contentSection.innerHTML = `
        <div class="email-greeting">
            Dear <strong>${transaction.currentPIC}</strong>,
        </div>
        
        <div class="email-body-text">
            This is a follow-up reminder regarding the transaction below that requires your attention. 
            The transaction has been pending for <strong>${transaction.agingDays} days</strong> and is currently 
            marked as <span class="${agingBadgeClass}">${agingLabel}</span>.
        </div>
        
        <div class="email-details-box">
            <h4><i class="fas fa-info-circle"></i> Transaction Details</h4>
            <div class="email-detail-row">
                <strong>Transaction Name:</strong>
                <span>${transaction.transactionName}</span>
            </div>
            <div class="email-detail-row">
                <strong>Transaction Type:</strong>
                <span>${transaction.transactionType}</span>
            </div>
            <div class="email-detail-row">
                <strong>Requestor:</strong>
                <span>${transaction.requestor}</span>
            </div>
            <div class="email-detail-row">
                <strong>Current Stage:</strong>
                <span>${transaction.currentStage}</span>
            </div>
            <div class="email-detail-row">
                <strong>Status:</strong>
                <span class="status-badge status-${transaction.status}">${getStatusDisplayName(transaction.status)}</span>
            </div>
            <div class="email-detail-row">
                <strong>Aging Days:</strong>
                <span>${transaction.agingDays} days</span>
            </div>
            <div class="email-detail-row">
                <strong>SLA Status:</strong>
                <span class="${agingBadgeClass}">${agingLabel}</span>
            </div>
            <div class="email-detail-row">
                <strong>Submitted Date:</strong>
                <span>${transaction.submittedDate}</span>
            </div>
            <div class="email-detail-row">
                <strong>Last Updated:</strong>
                <span>${transaction.lastUpdated}</span>
            </div>
        </div>
        
        <div class="email-body-text">
            Please take immediate action to move this transaction forward. You can access the transaction details here:
        </div>
        
        <div style="margin: 1rem 0;">
            <a href="${transaction.sharePointLink}" target="_blank" class="email-link-button">
                <i class="fas fa-external-link-alt"></i> Open Transaction in SharePoint
            </a>
        </div>
        
        <div class="email-body-text">
            If you have already taken action or if there are any issues preventing progress, please inform the transaction requestor or contact the system administrator.
        </div>
        
        <div class="email-signature">
            <strong>Best regards,</strong><br>
            SCM Monitoring System<br>
            <em style="font-size: 0.8rem; color: #8a8886;">
                This is an automated message from the SCM Monitoring System. Please do not reply to this email.
            </em>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    
    // Store transaction data for sending
    modal.dataset.transaction = JSON.stringify(transaction);
}

function closeEmailPreviewModal() {
    const modal = document.getElementById('emailPreviewModal');
    modal.classList.remove('active');
    delete modal.dataset.transaction;
}

async function simulateSendEmail() {
    const modal = document.getElementById('emailPreviewModal');
    const sendBtn = document.getElementById('sendEmailBtn');
    const cancelBtn = document.getElementById('cancelEmailBtn');
    
    // Get transaction data
    const transaction = JSON.parse(modal.dataset.transaction || '{}');
    if (!transaction.transactionName) {
        showToast('Unable to send email: transaction data not found.', 'error');
        return;
    }
    
    // Disable buttons and show sending state
    sendBtn.disabled = true;
    cancelBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close modal
    closeEmailPreviewModal();
    
    // Show success message
    showToast(
        `Follow-up email successfully sent to ${transaction.currentPIC} with CC to ${transaction.requestor} and System Admin.`,
        'success'
    );
    
    // Update the follow-up button state
    const buttonId = `followup-${transaction.transactionName.replace(/\s+/g, '-')}`;
    const followupBtn = document.getElementById(buttonId);
    if (followupBtn) {
        followupBtn.innerHTML = '<i class="fas fa-check"></i> Sent';
        followupBtn.classList.add('btn-sent');
        followupBtn.disabled = true;
    }
    
    // Reset button states
    sendBtn.disabled = false;
    cancelBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Email';
}

// // ─── Follow Up Email ──────────────────────────────────────────
// async function sendFollowUpEmail(buttonEl, transaction) {
//     if (!transaction) {
//         showToast('Unable to send email: transaction data not found.', 'error');
//         return;
//     }

//     buttonEl.disabled = true;
//     buttonEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

//     try {
//         const res = await fetch('http://localhost:5000/api/send-followup-email', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 transactionName: transaction.transactionName,
//                 transactionType: transaction.transactionType,
//                 agingDays: transaction.agingDays,
//                 agingLevel: transaction.agingLevel,
//                 currentPIC: transaction.currentPIC,
//                 requestor: transaction.requestor,
//                 currentPICEmail: transaction.currentPICEmail,
//                 requestorEmail: transaction.requestorEmail,
//                 sharePointLink: transaction.sharePointLink
//             })
//         });

//         const data = await res.json();
//         if (!data.success) throw new Error(data.error || 'Unknown error');

//         buttonEl.innerHTML = '<i class="fas fa-check"></i> Sent';
//         buttonEl.classList.add('btn-sent');
//         showToast(`Follow-up email sent to ${transaction.currentPIC}.`, 'success');
//     } catch (error) {
//         buttonEl.disabled = false;
//         buttonEl.innerHTML = '<i class="fas fa-envelope"></i> Follow Up';
//         showToast(`Failed to send email: ${error.message}`, 'error');
//     }
// }

// ─── Modal ────────────────────────────────────────────────────
function openTransactionModal(transaction) {
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
                    <span class="aging-indicator aging-${transaction.agingLevel}" style="margin-left:0.5rem;">
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

// ─── Pagination ───────────────────────────────────────────────
function updatePagination() {
    const total = Math.max(1, Math.ceil(filteredEscalationTransactions.length / itemsPerPage));
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent  = total;
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= total;
}

function changePage(direction) {
    const total = Math.ceil(filteredEscalationTransactions.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + direction), total);
    renderTransactions();
}

// ─── Metric ───────────────────────────────────────────────────
function updateMetric() {
    const shown = document.getElementById('shownTransactionCount');
    const total = document.getElementById('totalTransactionCount');
    if (shown) shown.textContent = filteredEscalationTransactions.length;
    if (total) total.textContent = allEscalationTransactions.length;
}

// ─── View Toggle ─────────────────────────────────────────────
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.view === view)
    );
    document.getElementById('tableView').classList.toggle('hidden', view !== 'table');
    document.getElementById('cardView').classList.toggle('hidden', view !== 'card');
    renderTransactions();
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const icons  = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };

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
        'pending':               'Pending',
        'for-additional-input':  'For Additional Input',
        'transaction-completed': 'Transaction Completed'
    };
    return map[status] || status;
}

function setupEventListeners() {
    // Prevent duplicate binding if called again
    if (setupEventListeners._bound) return;
    setupEventListeners._bound = true;

    const byId = (id) => document.getElementById(id);

    const searchInput = byId('searchInput');
    const agingFilter = byId('agingFilter');
    const stageFilter = byId('stageFilter');
    const typeFilter = byId('transactionTypeFilter');
    const picFilter = byId('currentPICFilter');
    const refreshBtn = byId('refreshBtn');
    const prevPage = byId('prevPage');
    const nextPage = byId('nextPage');
    const closeModalBtn = byId('closeModal');
    const modal = byId('transactionModal');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (agingFilter) agingFilter.addEventListener('change', applyFilters);
    if (stageFilter) stageFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (picFilter) picFilter.addEventListener('change', applyFilters);

    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (searchInput) searchInput.value = '';
            if (agingFilter) agingFilter.value = 'all';
            if (stageFilter) stageFilter.value = 'all';
            if (typeFilter) typeFilter.value = 'all';
            if (picFilter) picFilter.value = 'all';

            document.querySelectorAll('.summary-card').forEach(c => c.classList.remove('card-active'));
            await loadEscalationData();
        });
    }

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchView(this.dataset.view);
        });
    });

    if (prevPage) prevPage.addEventListener('click', () => changePage(-1));
    if (nextPage) nextPage.addEventListener('click', () => changePage(1));

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }

    // Email preview modal listeners
    const closeEmailPreviewBtn = byId('closeEmailPreview');
    const cancelEmailBtn = byId('cancelEmailBtn');
    const sendEmailBtn = byId('sendEmailBtn');
    const emailPreviewModal = byId('emailPreviewModal');
    
    if (closeEmailPreviewBtn) {
        closeEmailPreviewBtn.addEventListener('click', closeEmailPreviewModal);
    }
    
    if (cancelEmailBtn) {
        cancelEmailBtn.addEventListener('click', closeEmailPreviewModal);
    }
    
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', simulateSendEmail);
    }
    
    if (emailPreviewModal) {
        emailPreviewModal.addEventListener('click', function(e) {
            if (e.target === this) closeEmailPreviewModal();
        });
    }

    // Delegated click handler for View and Follow Up buttons
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const key = btn.dataset.key;
        const tx = escalationTxIndex.get(key);

        if (!tx) {
            showToast('Transaction not found.', 'error');
            return;
        }

        if (action === 'view') {
            openTransactionModal(tx);
        } else if (action === 'followup') {
            openEmailPreviewModal(tx);
        }
    });

    // Summary card click → filter
    document.querySelectorAll('.summary-card[data-filter-type]').forEach(card => {
        card.addEventListener('click', function () {
            const isActive = this.classList.contains('card-active');
            document.querySelectorAll('.summary-card').forEach(c => c.classList.remove('card-active'));

            if (!isActive) {
                this.classList.add('card-active');
            }

            if (agingFilter) {
                agingFilter.value = isActive ? 'all' : this.dataset.filterValue;
            }

            const section = document.querySelector('.transactions-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });

            applyFilters();
        });
    });
}