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