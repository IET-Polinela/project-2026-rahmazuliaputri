const API_BASE_URL = 'http://103.151.63.84:8009';

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
    });

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (response.status === 200 && data && data.access) {
        localStorage.setItem('access_token', data.access);
        return data.access;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
}

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    let accessToken = localStorage.getItem('access_token');

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

    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;

            response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        } else {
            alert('Sesi login sudah habis. Silakan login ulang.');
            window.location.hash = '#login';

            return {
                status: 401,
                ok: false,
                data: null
            };
        }
    }

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    return {
        status: response.status,
        ok: response.ok,
        data: data
    };
}