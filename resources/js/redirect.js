document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get('code');
    const error = params.get('error');

    const redirectToMainPage = (errorMessage = '') => {
        const basePath = window.location.origin; // Use origin to construct the base path
        const currentPath = window.location.pathname.split('/').slice(0, -1).join('/');
        const url = new URL(`${basePath}${currentPath}/`);
        if (errorMessage) {
            url.searchParams.append('error', errorMessage);
        }
        window.location.href = url.toString();
    };

    if (error === 'access_denied') {
        console.error('Authorization was denied by the user.');
        redirectToMainPage('Authorization was denied by the user.');
        return;
    }

    if (!authorizationCode) {
        console.error('No authorization code found.');
        redirectToMainPage('Error processing authorization. Please try again. If issue persists, please email the support email located at the bottom of this page.');
        return;
    }

    try {
        const payload = new URLSearchParams();
        payload.append('action', 'exchangeCode');
        payload.append('code', authorizationCode);
        payload.append('accessToken', 'NULL');

        const response = await fetch('https://script.google.com/macros/s/AKfycbzUODbjTYMvw0SYDLhfdvHhSUxxVtyYt_QFEO33J2y_AXsq7X2qasNlTVrMmuukd6W_UQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: payload
        });

        if (!response.ok) {
            throw new Error(`Error exchanging code: ${response.statusText}`);
        }

        const responseData = await response.json();
        sessionStorage.setItem('accessToken', responseData.accessToken);

        const userPayload = new URLSearchParams();
        userPayload.append('action', 'getUserInfo');
        userPayload.append('accessToken', responseData.accessToken);

        const userResponse = await fetch('https://script.google.com/macros/s/AKfycbzUODbjTYMvw0SYDLhfdvHhSUxxVtyYt_QFEO33J2y_AXsq7X2qasNlTVrMmuukd6W_UQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: userPayload
        });

        if (!userResponse.ok) {
            throw new Error(`Error fetching user info: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        sessionStorage.setItem('userInfo', JSON.stringify(userData));

        redirectToMainPage();
    } catch (error) {
        console.error('Error during code exchange:', error);
        redirectToMainPage(`Error during code exchange: ${error.message}`);
    }
});
