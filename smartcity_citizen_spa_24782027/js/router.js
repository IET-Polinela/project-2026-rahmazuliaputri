const routes = {
    '#login': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4">
                <div class="card shadow-sm border-0 p-4">
                    <h4 class="text-center fw-bold mb-4">
                        <i class="bi bi-person-circle me-2"></i>Login Warga
                    </h4>

                    <form id="loginForm">
                        <input type="text" id="loginUsername" class="form-control mb-3" placeholder="Username" required>
                        <input type="password" id="loginPassword" class="form-control mb-3" placeholder="Password" required>
                        <button type="submit" class="btn btn-enha-pink w-100 fw-bold">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `,

    '#dashboard': `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <button id="btnBukaModal" class="btn btn-enha-pink btn-lg w-100 fw-bold mb-3" data-bs-toggle="modal" data-bs-target="#reportModal">
                        <i class="bi bi-plus-circle-fill me-2"></i>Tambah Laporan Baru
                    </button>

                    <div class="list-group">
                        <button type="button" class="list-group-item list-group-item-action active-enha-pink" id="tabMyReports">
                            <i class="bi bi-file-earmark-text me-2"></i>Laporan Saya
                        </button>
                        <button type="button" class="list-group-item list-group-item-action" id="tabFeedKota">
                            <i class="bi bi-globe2 me-2"></i>Feed Kota
                        </button>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 class="fw-bold mb-0" id="dashboardTitle">Laporan Saya</h4>
                        <p class="text-muted small mb-0">Daftar laporan ditampilkan dari API secara otomatis.</p>
                    </div>
                </div>

                <div id="listContainer"></div>
                <div id="paginationContainer" class="mt-3"></div>
            </section>

            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm sticky-top" id="summaryStats" style="top: 20px;">
                    <h6 class="fw-bold mb-3">
                        <i class="bi bi-bar-chart-fill text-enha-pink me-2"></i>Rekap Status
                    </h6>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted">
                            <i class="bi bi-pencil-square me-1"></i>Draft
                        </span>
                        <span class="badge bg-secondary" id="statDraft">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted">
                            <i class="bi bi-hourglass-split me-1"></i>Diproses
                        </span>
                        <span class="badge bg-warning text-dark" id="statProcess">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <span class="small text-muted">
                            <i class="bi bi-check-circle-fill me-1"></i>Selesai
                        </span>
                        <span class="badge bg-success" id="statResolved">0</span>
                    </div>
                </div>
            </aside>
        </div>
    `
};

function updateNavbar(hash) {
    const navMenu = document.getElementById('nav-menus');

    if (!navMenu) {
        return;
    }

    if (hash === '#dashboard') {
        navMenu.innerHTML = `
            <button class="btn btn-light btn-sm fw-bold" onclick="logout()">
                <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
        `;
    } else {
        navMenu.innerHTML = `
            <a href="#login" class="btn btn-light btn-sm fw-bold">
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
            </a>
        `;
    }
}

function handleRouting() {
    const hash = window.location.hash || '#login';
    const appContent = document.getElementById('app-content');

    if (!appContent) {
        return;
    }

    const accessToken = localStorage.getItem('access_token');

    if (hash === '#dashboard' && !accessToken) {
        window.location.hash = '#login';
        return;
    }

    appContent.innerHTML = routes[hash] || routes['#login'];
    updateNavbar(hash);

    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }

    if (hash === '#dashboard' && typeof initDashboard === 'function') {
        initDashboard();
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);