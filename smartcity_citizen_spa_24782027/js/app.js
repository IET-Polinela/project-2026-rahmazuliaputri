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
    const tabFeedKota = document.getElementById('tabFeedKota') || document.getElementById('tabFeed');
    const openReportButton = document.getElementById('btnBukaModal');
    const btnDraft = document.getElementById('btnDraft');
    const btnSubmit = document.getElementById('btnSubmit');

    if (tabMyReports) {
        tabMyReports.onclick = function () {
            currentTab = 'my_reports';
            currentPage = 1;
            setActiveTab();
            loadDashboardData(currentTab, currentPage);
        };
    }

    if (tabFeedKota) {
        tabFeedKota.onclick = function () {
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

    if (btnSubmit) {
        btnSubmit.onclick = function () {
            submitReportForm('REPORTED');
        };
    }

    setActiveTab();
    loadDashboardData(currentTab, currentPage);
}

function setActiveTab() {
    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeedKota = document.getElementById('tabFeedKota') || document.getElementById('tabFeed');
    const dashboardTitle = document.getElementById('dashboardTitle');

    if (!tabMyReports || !tabFeedKota || !dashboardTitle) {
        return;
    }

    tabMyReports.classList.remove('active-enha-pink');
    tabFeedKota.classList.remove('active-enha-pink');

    if (currentTab === 'my_reports') {
        tabMyReports.classList.add('active-enha-pink');
        dashboardTitle.textContent = 'Laporan Saya';
    } else {
        tabFeedKota.classList.add('active-enha-pink');
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
        const reports = response.data.results || [];
        const totalData = response.data.count || 0;

        totalPages = Math.ceil(totalData / 10);

        renderList(reports);
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

    listContainer.innerHTML = `
        <div style="display:flex !important; flex-direction:column !important; gap:16px !important; width:100% !important;">
            ${reports.map(function (report) {
                const progress = getProgressByStatus(report.status);
                const badgeClass = getBadgeClass(report.status);
                const formattedDate = formatDate(report.updated_at);
                const reporterName = report.reporter_name || report.reporter || 'Warga Anonim';

                let actionButton = '';

                if (report.status === 'DRAFT' && report.is_owner === true) {
                    actionButton = `
                        <button type="button" class="btn btn-sm btn-secondary fw-bold mt-3" onclick="editDraft(${report.id})">
                            <i class="bi bi-pencil-square me-1"></i>Edit Draft
                        </button>
                    `;
                }

                return `
                    <div class="col" style="display:block !important; width:100% !important; max-width:100% !important; flex:0 0 100% !important; padding:0 !important;">
                        <div class="card border-0 shadow-sm" style="width:100% !important;">
                            <div class="card-body" style="padding:18px !important;">
                                <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                                    <div style="min-width:0;">
                                        <h5 class="fw-bold mb-1" style="word-break:break-word;">${escapeHtml(report.title)}</h5>
                                        <p class="small text-muted mb-0">
                                            <i class="bi bi-person-circle me-1"></i>${escapeHtml(reporterName)}
                                            <span class="mx-1">•</span>
                                            <i class="bi bi-clock me-1"></i>${formattedDate}
                                        </p>
                                    </div>
                                    <span class="badge ${badgeClass}" style="flex-shrink:0;">${escapeHtml(report.status)}</span>
                                </div>

                                <p class="mb-2" style="word-break:break-word;">${escapeHtml(report.description)}</p>

                                <p class="small text-muted mb-3">
                                    <i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(report.location)}
                                    <span class="mx-1">•</span>
                                    <i class="bi bi-tag-fill me-1"></i>${escapeHtml(report.category)}
                                </p>

                                <div class="progress" style="height:10px;">
                                    <div class="progress-bar ${progress.className}" role="progressbar" style="width:${progress.value}%;" aria-valuenow="${progress.value}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>

                                <p class="small text-muted mt-2 mb-0">${progress.text}</p>

                                ${actionButton}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
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
    const response = await requestAPI(`/api/report/${id}/`, 'GET');

    if (response.status === 200 && response.data) {
        const report = response.data;

        editingReportId = id;

        document.getElementById('inputTitle').value = report.title || '';
        document.getElementById('inputCategory').value = report.category || '';
        document.getElementById('inputLocation').value = report.location || '';
        document.getElementById('inputDescription').value = report.description || '';

        const modalTitle = document.getElementById('reportModalLabel');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan';
        }

        const modalElement = document.getElementById('reportModal');
        const reportModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        reportModal.show();
    } else {
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
        title: document.getElementById('inputTitle').value,
        category: document.getElementById('inputCategory').value,
        location: document.getElementById('inputLocation').value,
        description: document.getElementById('inputDescription').value,
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

    const response = await requestAPI(endpoint, method, payload);

    if (response.status === 201 || response.status === 200) {
        const modalElement = document.getElementById('reportModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

        modalInstance.hide();

        if (reportForm) {
            reportForm.reset();
        }

        editingReportId = null;

        if (statusValue === 'DRAFT') {
            alert('Laporan berhasil disimpan sebagai DRAFT');
        } else {
            alert('Laporan berhasil diajukan');
        }

        loadDashboardData(currentTab, currentPage);
    } else {
        console.log(response.data);
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