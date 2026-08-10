document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

try {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'same-origin'
    });

    if (res.ok) {
        const data = await res.json();
        if (data.success) {
            // Redirect to dashboard or show success message
            window.location.href = '/workflow-tracking';
            return;
        } 
    }
    const err = await res.json().catch(() => ({}));

    //failure
    alert(err.message || 'Invalid username or password.');
} catch (err) {
    console.error(err);
    alert('Unable to contact server.');
}
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = (document.getElementById('username').value || '').trim();
        const password = document.getElementById('password').value || '';

        if (!username || !password) {
            alert ('Please enter both username and password.');
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'same-origin'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    window.location.href = '/workflow-tracking';
                    return;
        }
        }
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Invalid credentials.');
    } catch (err) {
        console.error(err);
        alert('Unable to contact server.');
    }
}
);

});