import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// make Pusher available globally for Echo
window.Pusher = Pusher;

// simple function to read XSRF-TOKEN from cookies
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

async function testEcho() {
    try {
        // Step 1️⃣: Get CSRF cookie
        await fetch('http://localhost:8000/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'include',
        });
        console.log('✅ CSRF cookie fetched');

        // Step 2️⃣: Login
        const loginRes = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'mahmoud@gmail.com', password: '123456' }),
        });
        if (!loginRes.ok) throw new Error('Login failed');
        console.log('✅ Logged in');

        // Step 3️⃣: Initialize Echo
        const echo = new Echo({
            broadcaster: 'pusher',
            key: 'app-key',               // replace with your REVERB_APP_KEY
            wsHost: '127.0.0.1',
            wsPort: 8080,
            forceTLS: false,
            authEndpoint: 'http://localhost:8000/broadcasting/auth',
            auth: {
                headers: {
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
                },
            },
            withCredentials: true,
        });

        // Step 4️⃣: Subscribe to private channel
        const channel = echo.private('chat.1'); // replace 1 with a valid chatId

        channel.subscribed(() => console.log('✅ Subscribed to private-chat.1'));
        channel.error(err => console.error('❌ Channel auth error', err));

        channel.listen('MessageSent', e => {
            console.log('🔥 Message received:', e);
        });

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testEcho();
