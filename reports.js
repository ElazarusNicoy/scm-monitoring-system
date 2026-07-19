let allTransactions = [];       // full list from API
let reportTransactions = [];    // filtered list for export

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadReportData();
    setupReportEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

function updateCurrentTime() {
    const now = new Date();
    const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    const el = document.getElementById('currentTime');
    if (el) el.textContent = now.toLocaleString('en-US', options);
}

// ─── Load Data from API ────────────────────────────────────────
async function loadReportData() {
    try {
        // Load all transactions
        const [transRes, stageRes, typeRes, picRes] = await Promise.all([
            fetch('http://localhost:5000/api/all_transactions_list'),
            fetch('http://localhost:5000/api/distinct-stages'),
            fetch('http://localhost:5000/api/distinct-transaction-types'),
            fetch('http://localhost:5000/api/distinct-current-pics')
        ]);

        const transData  = await transRes.json();
        const stageData  = await stageRes.json();
        const typeData   = await typeRes.json();
        const picData    = await picRes.json();

        if (transData.success) {
            allTransactions = transData.allTransactionList.map(t => ({
                transactionName: t['Transaction Name'] || 'N/A',
                transactionType: t['Transaction Type'] || 'N/A',
                requestor:       t['Requestor'] || 'N/A',
                currentStage:    t['Current Stage'] || 'N/A',
                currentPIC:      t['Current PIC'] || 'N/A',
                status:          (t['Status'] || 'pending').toLowerCase().trim().replace(/\s+/g, '-'),
                agingDays:       t['Aging (Days)'] || 0,
                agingLevel:      (t['SLA Status'] || 'normal').toLowerCase().trim(),
                submittedDate:   t['Submitted Date'] || 'N/A',
                lastUpdated:     t['Last Updated'] || 'N/A'
            }));
        }

        // Populate dropdowns dynamically
        if (stageData.success) populateSelect('reportStageFilter', stageData.distinctStages);
        if (typeData.success)  populateSelect('reportTypeFilter',  typeData.distinctTransactionTypes);
        if (picData.success)   populateSelect('reportPICFilter',   picData.distinctCurrentPICs);

    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select) return;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.toLowerCase().replace(/\s+/g, '-');
        option.textContent = item;
        select.appendChild(option);
    });
}

// ─── Event Listeners ──────────────────────────────────────────
function setupReportEventListeners() {
    document.getElementById('applyReportFilter').addEventListener('click', applyReportFilters);
    document.getElementById('resetReportFilter').addEventListener('click', resetReportFilters);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportPDFBtn').addEventListener('click', exportToPDF);
}

// ─── Apply Filters ────────────────────────────────────────────
function applyReportFilters() {
    const dateFrom  = document.getElementById('reportDateFrom').value;
    const dateTo    = document.getElementById('reportDateTo').value;
    const typeFilter   = document.getElementById('reportTypeFilter').value;
    const statusFilter = document.getElementById('reportStatusFilter').value;
    const agingFilter  = document.getElementById('reportAgingFilter').value;
    const picFilter    = document.getElementById('reportPICFilter').value;
    const stageFilter  = document.getElementById('reportStageFilter').value;

    reportTransactions = allTransactions.filter(t => {
        // Date range filter
        const submittedDate = new Date(t.submittedDate);
        const matchesFrom = !dateFrom || submittedDate >= new Date(dateFrom);
        const matchesTo   = !dateTo   || submittedDate <= new Date(dateTo);

        const normalizedType  = t.transactionType.toLowerCase().replace(/\s+/g, '-');
        const normalizedStage = t.currentStage.toLowerCase().replace(/\s+/g, '-');
        const normalizedPIC   = t.currentPIC.toLowerCase().replace(/\s+/g, '-');

        const matchesType   = typeFilter   === 'all' || normalizedType  === typeFilter;
        const matchesStatus = statusFilter === 'all' || t.status        === statusFilter;
        const matchesAging  = agingFilter  === 'all' || t.agingLevel    === agingFilter;
        const matchesPIC    = picFilter    === 'all' || normalizedPIC   === picFilter;
        const matchesStage  = stageFilter  === 'all' || normalizedStage === stageFilter;

        return matchesFrom && matchesTo && matchesType && matchesStatus
             && matchesAging && matchesPIC && matchesStage;
    });

    renderReportPreview(reportTransactions);
    updateReportCount(reportTransactions.length);

    // Enable export buttons if there are results
    const hasResults = reportTransactions.length > 0;
    document.getElementById('exportExcelBtn').disabled = !hasResults;
    document.getElementById('exportPDFBtn').disabled   = !hasResults;
}

// ─── Filter Presets Definition ────────────────────────────────
const FILTER_PRESETS = {
    'critical': {
        label: 'Critical Transactions',
        filters: { agingFilter: 'critical' }
    },
    'warning': {
        label: 'Warning Transactions',
        filters: { agingFilter: 'warning' }
    },
    'pending': {
        label: 'Pending Transactions',
        filters: { statusFilter: 'pending' }
    },
    'completed': {
        label: 'Completed Transactions',
        filters: { statusFilter: 'transaction-completed' }
    },
    'for-approval': {
        label: 'For Approval',
        filters: { statusFilter: 'for-approval' }
    },
    'this-month': {
        label: 'This Month',
        filters: {
            dateFrom: getFirstDayOfMonth(),   // ← computed dynamically
            dateTo:   getTodayDate()
        }
    },
    'critical-pending': {
        label: 'Critical + Pending',
        filters: {
            agingFilter:  'critical',
            statusFilter: 'pending'
        }
    },
    'mas': {
        label: 'MAS Only',
        filters: { typeFilter: 'mas' }
    },
    'rcp': {
        label: 'RCP Only',
        filters: { typeFilter: 'rcp' }
    },
    'pr': {
        label: 'PR Only',
        filters: { typeFilter: 'pr' }
    }
};

// ─── Date Helpers ─────────────────────────────────────────────
function getFirstDayOfMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

// ─── Apply Preset ─────────────────────────────────────────────
function applyPreset(presetKey) {
    const preset = FILTER_PRESETS[presetKey];
    if (!preset) return;

    // Remove active from all pills first
    document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('pill-active'));

    // Highlight selected pill
    const activePill = document.querySelector(`.preset-pill[data-preset="${presetKey}"]`);
    if (activePill) activePill.classList.add('pill-active');

    // Reset all filters first
    resetFiltersOnly();

    // Apply preset filter values
    const f = preset.filters;
    if (f.agingFilter)  document.getElementById('reportAgingFilter').value  = f.agingFilter;
    if (f.statusFilter) document.getElementById('reportStatusFilter').value = f.statusFilter;
    if (f.typeFilter)   document.getElementById('reportTypeFilter').value   = f.typeFilter;
    if (f.picFilter)    document.getElementById('reportPICFilter').value    = f.picFilter;
    if (f.stageFilter)  document.getElementById('reportStageFilter').value  = f.stageFilter;
    if (f.dateFrom)     document.getElementById('reportDateFrom').value     = f.dateFrom;
    if (f.dateTo)       document.getElementById('reportDateTo').value       = f.dateTo;

    // Auto-apply and preview immediately
    applyReportFilters();

    console.log(`Preset applied: "${preset.label}"`);
}

// Reset filter values only (without clearing preview)
function resetFiltersOnly() {
    document.getElementById('reportDateFrom').value     = '';
    document.getElementById('reportDateTo').value       = '';
    document.getElementById('reportTypeFilter').value   = 'all';
    document.getElementById('reportStatusFilter').value = 'all';
    document.getElementById('reportAgingFilter').value  = 'all';
    document.getElementById('reportPICFilter').value    = 'all';
    document.getElementById('reportStageFilter').value  = 'all';
}

// ─── Event Listeners (updated) ────────────────────────────────
function setupReportEventListeners() {
    document.getElementById('applyReportFilter').addEventListener('click', () => {
        // Clicking Apply manually clears the active preset pill
        document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('pill-active'));
        applyReportFilters();
    });

    document.getElementById('resetReportFilter').addEventListener('click', resetReportFilters);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportPDFBtn').addEventListener('click', exportToPDF);

    // Wire up all preset pills
    document.querySelectorAll('.preset-pill').forEach(pill => {
        pill.addEventListener('click', function () {
            const presetKey = this.dataset.preset;

            // Clicking same active pill → reset filters
            if (this.classList.contains('pill-active')) {
                this.classList.remove('pill-active');
                resetReportFilters();
            } else {
                applyPreset(presetKey);
            }
        });
    });
}

function resetReportFilters() {
    resetFiltersOnly();
    document.getElementById('reportDateFrom').value = '';
    document.getElementById('reportDateTo').value   = '';
    document.getElementById('reportTypeFilter').value   = 'all';
    document.getElementById('reportStatusFilter').value = 'all';
    document.getElementById('reportAgingFilter').value  = 'all';
    document.getElementById('reportPICFilter').value    = 'all';
    document.getElementById('reportStageFilter').value  = 'all';

    document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('pill-active'));

    reportTransactions = [];
    renderReportPreview([]);
    updateReportCount(0);
    document.getElementById('exportExcelBtn').disabled = true;
    document.getElementById('exportPDFBtn').disabled   = true;
}

// ─── Render Preview ───────────────────────────────────────────
function renderReportPreview(transactions) {
    const tbody = document.getElementById('reportTableBody');

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="report-empty-state">
                    <i class="fas fa-inbox"></i>
                    No transactions match the selected filters.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = transactions.map((t, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${t.transactionName}</strong></td>
            <td>${t.transactionType}</td>
            <td>${t.requestor}</td>
            <td>${t.currentStage}</td>
            <td>${t.currentPIC}</td>
            <td><span class="status-badge status-${t.status}">${getStatusDisplayName(t.status)}</span></td>
            <td>${t.agingDays} days</td>
            <td><span class="aging-indicator aging-${t.agingLevel}">${t.agingLevel.toUpperCase()}</span></td>
            <td>${t.submittedDate}</td>
            <td>${t.lastUpdated}</td>
        </tr>
    `).join('');
}

function updateReportCount(count) {
    document.getElementById('reportTransactionCount').textContent = count;
}

function getStatusDisplayName(status) {
    const map = {
        'for-approval':         'For Approval',
        'pending':               'Pending',
        'for-additional-input': 'For Additional Input',
        'transaction-completed': 'Transaction Completed'
    };
    return map[status] || status;
}

// ─── Export to Excel ──────────────────────────────────────────
function exportToExcel() {
    if (reportTransactions.length === 0) return;

    const exportData = reportTransactions.map((t, index) => ({
        '#':                 index + 1,
        'Transaction Name':  t.transactionName,
        'Transaction Type':  t.transactionType,
        'Requestor':         t.requestor,
        'Current Stage':     t.currentStage,
        'Current PIC':       t.currentPIC,
        'Status':            getStatusDisplayName(t.status),
        'Aging (Days)':      t.agingDays,
        'SLA Status':        t.agingLevel.toUpperCase(),
        'Submitted Date':    t.submittedDate,
        'Last Updated':      t.lastUpdated
    }));

    const worksheet  = XLSX.utils.json_to_sheet(exportData);
    const workbook   = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Auto-fit column widths
    const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key] || '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `SCM_Transactions_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log(`Excel exported: ${fileName}`);
}

// ─── Export to PDF ────────────────────────────────────────────
function exportToPDF() {
    if (reportTransactions.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Report header
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // primary blue
    doc.text('SCM Monitoring System — Transaction Report', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 22);
    doc.text(`Total Transactions: ${reportTransactions.length}`, 14, 28);

    // Table using jsPDF AutoTable
    doc.autoTable({
        startY: 34,
        head: [[
            '#', 'Transaction Name', 'Type', 'Requestor',
            'Current Stage', 'Current PIC', 'Status',
            'Aging (Days)', 'SLA Status', 'Submitted Date', 'Last Updated'
        ]],
        body: reportTransactions.map((t, index) => [
            index + 1,
            t.transactionName,
            t.transactionType,
            t.requestor,
            t.currentStage,
            t.currentPIC,
            getStatusDisplayName(t.status),
            `${t.agingDays} days`,
            t.agingLevel.toUpperCase(),
            t.submittedDate,
            t.lastUpdated
        ]),
        styles: {
            fontSize: 8,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [37, 99, 235],   // primary blue
            textColor: 255,
            fontStyle: 'bold'
        },
        // Color-code aging rows
        didParseCell: function (data) {
            if (data.section === 'body') {
                const slaStatus = data.row.raw[8]; // SLA Status column
                if (slaStatus === 'CRITICAL') {
                    data.cell.styles.fillColor = [254, 226, 226]; // red tint
                    data.cell.styles.textColor = [185, 28, 28];
                } else if (slaStatus === 'WARNING') {
                    data.cell.styles.fillColor = [254, 249, 195]; // yellow tint
                    data.cell.styles.textColor = [161, 98, 7];
                }
            }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const fileName = `SCM_Transactions_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    console.log(`PDF exported: ${fileName}`);
}

