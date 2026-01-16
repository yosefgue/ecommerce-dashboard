export async function signIn(email, password) {
    try {
        const res = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });

        let data = null;
        data = await res.json();
        
        if (!res.ok) {
        const msg = data && data.error ? data.error : 'Invalid credentials';
        throw new Error(msg);
        }

        const token = data && data.token;
        if (!token) {
        throw new Error('No token returned from Reqres');
        }

        localStorage.setItem('token', token);
        return token;
    } catch (err) {
        console.warn('Reqres login failed, using local fallback auth:', err);

        const validEmail = 'eve.holt@reqres.in';
        const validPassword = 'cityslicka';

        if (email === validEmail && password === validPassword) {
        const token = 'dummy-local-token';
        localStorage.setItem('token', token);
        return token;
        }

        throw err;
    }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

export function logout() {
  localStorage.removeItem('token');
}
