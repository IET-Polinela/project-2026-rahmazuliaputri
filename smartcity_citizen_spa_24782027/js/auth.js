function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const payload = {
            username: username,
            password: password
        };

        const result = await requestAPI('/api/token/', 'POST', payload);

        if (result.status === 200) {
            localStorage.setItem('access_token', result.data.access);
            localStorage.setItem('refresh_token', result.data.refresh);

            alert('Login berhasil');
            window.location.hash = '#dashboard';
        } else {
            alert('Login gagal. Periksa username dan password.');
        }
    });
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    alert('Logout berhasil');
    window.location.hash = '#login';
}