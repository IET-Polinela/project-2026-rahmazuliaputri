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
                    <button class="btn btn-enha-pink btn-lg w-100 fw-bold mb-3">
                        <i class="bi bi-plus-circle-fill me-2"></i>Laporan Baru
                    </button>

                    <div class="list-group">
                        <a href="#dashboard" class="list-group-item list-group-item-action active-enha-pink">
                            <i class="bi bi-speedometer2 me-2"></i>Dashboard
                        </a>
                        <a href="#dashboard" class="list-group-item list-group-item-action">
                            <i class="bi bi-file-earmark-text me-2"></i>Laporan Saya
                        </a>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card border-0 p-4 shadow-sm text-center text-muted border-dashed">
                    <i class="bi bi-inbox fs-1"></i>
                    <h5 class="mt-3">Selamat Datang</h5>
                    <p class="small">
                        Koneksi API untuk data laporan akan diimplementasikan pada Lab 12.
                    </p>
                </div>
            </section>

            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <h6 class="fw-bold">
                        <i class="bi bi-info-circle-fill text-enha-pink me-2"></i>Pengumuman
                    </h6>
                    <p class="small text-muted mb-0">
                        Gunakan portal ini untuk mengirim dan memantau laporan warga.
                    </p>
                </div>
            </aside>
        </div>
    `
};

function updateNavbar(hash) {
    const navMenu = document.getElementById('nav-menu');

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

    appContent.innerHTML = routes[hash] || routes['#login'];
    updateNavbar(hash);

    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);