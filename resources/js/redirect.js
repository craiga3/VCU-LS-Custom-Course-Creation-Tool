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

    const response = await fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
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

    const userResponse = await fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
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

    // Use a switch statement to handle the success property
    switch (userData.success) {
        case true:
            // Success: Store user info and redirect
            sessionStorage.setItem('userInfo', JSON.stringify(userData));
            redirectToMainPage();
            break;

        case false:
            // Failure: Log the message and redirect with an error
            console.error('User verification failed:', userData.message);
            redirectToMainPage('Not authorized: No verification role found.');
            break;

        default:
            // Handle unexpected cases
            console.error('Unexpected response format:', userData);
            redirectToMainPage('An unexpected error occurred. Please try again.');
            break;
    }
} catch (error) {
    console.error('Error during code exchange:', error);
    redirectToMainPage(`Error during code exchange: ${error.message}`);
}