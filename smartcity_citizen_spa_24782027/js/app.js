let currentTab = 'my_reports';
let currentPage = 1;
let totalPages = 1;
let editingReportId = null;

document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');

    if (!window.location.hash) {
        if (accessToken) {
            window.location.hash = '#dashboard';
        } else {
            window.location.hash = '#login';
        }
    }
});

function initDashboard() {
    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeed = document.getElementById('tabFeed');
    const openReportButton = document.querySelector('[data-bs-target="#reportModal"]');
    const btnDraft = document.getElementById('btnDraft');
    const btnSubmitReport = document.getElementById('btnSubmitReport');

    if (tabMyReports) {
        tabMyReports.onclick = function () {
            currentTab = 'my_reports';
            currentPage = 1;
            setActiveTab();
            loadDashboardData(currentTab, currentPage);
        };
    }

    if (tabFeed) {
        tabFeed.onclick = function () {
            currentTab = 'feed';
            currentPage = 1;
            setActiveTab();
            loadDashboardData(currentTab, currentPage);
        };
    }

    if (openReportButton) {
        openReportButton.onclick = function () {
            resetReportModal();
        };
    }

    if (btnDraft) {
        btnDraft.onclick = function () {
            submitReportForm('DRAFT');
        };
    }

    if (btnSubmitReport) {
        btnSubmitReport.onclick = function () {
            submitReportForm('REPORTED');
        };
    }

    setActiveTab();
    loadDashboardData(currentTab, currentPage);
}

function setActiveTab() {
    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeed = document.getElementById('tabFeed');
    const dashboardTitle = document.getElementById('dashboardTitle');

    if (!tabMyReports || !tabFeed || !dashboardTitle) {
        return;
    }

    tabMyReports.classList.remove('active-enha-pink');
    tabFeed.classList.remove('active-enha-pink');

    if (currentTab === 'my_reports') {
        tabMyReports.classList.add('active-enha-pink');
        dashboardTitle.textContent = 'Laporan Saya';
    } else {
        tabFeed.classList.add('active-enha-pink');
        dashboardTitle.textContent = 'Feed Kota';
    }
}

async function loadDashboardData(tab = currentTab, page = currentPage) {
    currentTab = tab;
    currentPage = page;

    const listContainer = document.getElementById('listContainer');
    const paginationContainer = document.getElementById('paginationContainer');

    if (listContainer) {
        listContainer.innerHTML = `
            <div class="card border-0 shadow-sm p-4 text-center text-muted">
                <div class="spinner-border text-enha-pink mb-3" role="status"></div>
                <p class="mb-0">Memuat data laporan...</p>
            </div>
        `;
    }

    const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}`, 'GET');

    if (response && response.status === 200) {
        const allReports = response.data.results || [];
        const totalData = response.data.count || 0;

        totalPages = Math.ceil(totalData / 10);

        renderList(allReports);
        renderPagination();
        loadSummaryStats();
    } else {
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="card border-0 shadow-sm p-4 text-center text-muted">
                    <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
                    <p class="mt-3 mb-0">Gagal memuat data laporan.</p>
                </div>
            `;
        }

        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    }
}

async function loadSummaryStats() {
    const response = await requestAPI('/api/report/?tab=my_reports&page_size=1000', 'GET');

    if (response && response.status === 200) {
        const reports = response.data.results || [];

        const totalDraft = reports.filter(function (report) {
            return report.status === 'DRAFT';
        }).length;

        const totalProcess = reports.filter(function (report) {
            return report.status === 'REPORTED' || report.status === 'VERIFIED' || report.status === 'IN_PROGRESS';
        }).length;

        const totalResolved = reports.filter(function (report) {
            return report.status === 'RESOLVED';
        }).length;

        const statDraft = document.getElementById('statDraft');
        const statProcess = document.getElementById('statProcess');
        const statResolved = document.getElementById('statResolved');

        if (statDraft) {
            statDraft.textContent = totalDraft;
        }

        if (statProcess) {
            statProcess.textContent = totalProcess;
        }

        if (statResolved) {
            statResolved.textContent = totalResolved;
        }
    }
}

function renderList(reports) {
    const listContainer = document.getElementById('listContainer');

    if (!listContainer) {
        return;
    }

    if (!reports || reports.length === 0) {
        listContainer.innerHTML = `
            <div class="card border-0 shadow-sm p-4 text-center text-muted">
                <i class="bi bi-inbox fs-1"></i>
                <h5 class="mt-3">Belum ada laporan</h5>
                <p class="small mb-0">Data laporan pada tab ini masih kosong.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = reports.map(function (report) {
        const progress = getProgressByStatus(report.status);
        const badgeClass = getBadgeClass(report.status);
        const formattedDate = formatDate(report.updated_at);
        let actionButton = '';

        if (report.status === 'DRAFT' && report.is_owner === true) {
            actionButton = `
                <button type="button" class="btn btn-sm btn-outline-secondary mt-3" onclick="editDraft(${report.id})">
                    <i class="bi bi-pencil-square me-1"></i>Edit Draft
                </button>
            `;
        }

        return `
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="fw-bold mb-1">${escapeHtml(report.title)}</h5>
                            <p class="small text-muted mb-0">
                                <i class="bi bi-person-circle me-1"></i>${escapeHtml(report.reporter)}
                                <span class="mx-1">•</span>
                                <i class="bi bi-clock me-1"></i>${formattedDate}
                            </p>
                        </div>
                        <span class="badge ${badgeClass}">${escapeHtml(report.status)}</span>
                    </div>

                    <p class="mb-2">${escapeHtml(report.description)}</p>

                    <p class="small text-muted mb-3">
                        <i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(report.location)}
                        <span class="mx-1">•</span>
                        <i class="bi bi-tag-fill me-1"></i>${escapeHtml(report.category)}
                    </p>

                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar ${progress.className}" role="progressbar" style="width: ${progress.value}%;" aria-valuenow="${progress.value}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <p class="small text-muted mt-2 mb-0">${progress.text}</p>

                    ${actionButton}
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');

    if (!paginationContainer) {
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let pageButtons = '';

    for (let page = 1; page <= totalPages; page++) {
        pageButtons += `
            <li class="page-item ${page === currentPage ? 'active' : ''}">
                <button class="page-link" type="button" onclick="loadDashboardData('${currentTab}', ${page})">
                    ${page}
                </button>
            </li>
        `;
    }

    paginationContainer.innerHTML = `
        <nav aria-label="Navigasi halaman laporan">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" type="button" onclick="loadDashboardData('${currentTab}', ${currentPage - 1})">
                        Sebelumnya
                    </button>
                </li>

                ${pageButtons}

                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" type="button" onclick="loadDashboardData('${currentTab}', ${currentPage + 1})">
                        Berikutnya
                    </button>
                </li>
            </ul>
        </nav>
    `;
}

async function editDraft(id) {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        alert('Sesi login tidak ditemukan. Silakan login ulang.');
        window.location.hash = '#login';
        return;
    }

    const response = await fetch(`${API_BASE_URL}/api/report/${id}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    let report = null;

    try {
        report = await response.json();
    } catch (error) {
        report = null;
    }

    if (response.status === 200 && report) {
        editingReportId = id;

        document.getElementById('reportTitle').value = report.title || '';
        document.getElementById('reportCategory').value = report.category || '';
        document.getElementById('reportLocation').value = report.location || '';
        document.getElementById('reportDescription').value = report.description || '';

        const modalTitle = document.getElementById('reportModalLabel');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan';
        }

        const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
        reportModal.show();
    } else if (response.status === 401) {
        alert('Sesi login tidak valid. Silakan login ulang.');
        localStorage.clear();
        window.location.hash = '#login';
    } else {
        console.log(report);
        alert('Gagal mengambil data draft.');
    }
}

async function submitReportForm(statusValue) {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        alert('Sesi login tidak ditemukan. Silakan login ulang.');
        window.location.hash = '#login';
        return;
    }

    const reportForm = document.getElementById('reportForm');

    const payload = {
        title: document.getElementById('reportTitle').value,
        category: document.getElementById('reportCategory').value,
        location: document.getElementById('reportLocation').value,
        description: document.getElementById('reportDescription').value,
        status: statusValue
    };

    if (!payload.title || !payload.category || !payload.location || !payload.description) {
        alert('Semua field laporan wajib diisi.');
        return;
    }

    let endpoint = '/api/report/';
    let method = 'POST';

    if (editingReportId !== null) {
        endpoint = `/api/report/${editingReportId}/`;
        method = 'PUT';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
    });

    let responseData = null;

    try {
        responseData = await response.json();
    } catch (error) {
        responseData = null;
    }

    if (response.status === 201 || response.status === 200) {
        const modalElement = document.getElementById('reportModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        if (modalInstance) {
            modalInstance.hide();
        }

        reportForm.reset();
        editingReportId = null;
        loadDashboardData(currentTab, currentPage);
    } else if (response.status === 401) {
        alert('Sesi login tidak valid. Silakan login ulang.');
        localStorage.clear();
        window.location.hash = '#login';
    } else {
        console.log(responseData);
        alert('Gagal menyimpan laporan.');
    }
}

function resetReportModal() {
    editingReportId = null;

    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.reset();
    }

    const modalTitle = document.getElementById('reportModalLabel');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Buat Laporan Baru';
    }
}

function getProgressByStatus(status) {
    if (status === 'DRAFT') {
        return {
            value: 20,
            className: 'bg-secondary',
            text: 'Laporan masih berupa draft.'
        };
    }

    if (status === 'REPORTED') {
        return {
            value: 40,
            className: 'bg-info',
            text: 'Laporan sudah diajukan.'
        };
    }

    if (status === 'VERIFIED') {
        return {
            value: 60,
            className: 'bg-primary',
            text: 'Laporan sudah diverifikasi.'
        };
    }

    if (status === 'IN_PROGRESS') {
        return {
            value: 80,
            className: 'bg-warning',
            text: 'Laporan sedang diproses.'
        };
    }

    if (status === 'RESOLVED') {
        return {
            value: 100,
            className: 'bg-success',
            text: 'Laporan sudah selesai.'
        };
    }

    return {
        value: 0,
        className: 'bg-secondary',
        text: 'Status laporan belum diketahui.'
    };
}

function getBadgeClass(status) {
    if (status === 'DRAFT') {
        return 'bg-secondary';
    }

    if (status === 'REPORTED') {
        return 'bg-info';
    }

    if (status === 'VERIFIED') {
        return 'bg-primary';
    }

    if (status === 'IN_PROGRESS') {
        return 'bg-warning text-dark';
    }

    if (status === 'RESOLVED') {
        return 'bg-success';
    }

    return 'bg-secondary';
}

function formatDate(dateText) {
    if (!dateText) {
        return '-';
    }

    const date = new Date(dateText);

    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}