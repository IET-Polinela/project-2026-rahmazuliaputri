const API_BASE_URL = 'http://127.0.0.1:8000';

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const accessToken = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (bodyData) {
        options.body = JSON.stringify(bodyData);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (response.status === 401) {
        alert('Sesi login sudah habis. Silakan login ulang.');
        localStorage.clear();
        window.location.hash = '#login';

        return {
            status: response.status,
            ok: response.ok,
            data: data
        };
    }

    return {
        status: response.status,
        ok: response.ok,
        data: data
    };
}