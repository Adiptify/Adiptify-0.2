const API_BASE = 'http://localhost:4000';

/**
 * Fetch wrapper that includes JWT token and handles errors
 */
export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('adiptify_token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
        localStorage.removeItem('adiptify_token');
        localStorage.removeItem('adiptify_user');
        window.location.hash = '#/login';
        throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Login user and save token
 */
export async function loginUser(email, password) {
    const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
    });
    localStorage.setItem('adiptify_token', data.token);
    localStorage.setItem('adiptify_user', JSON.stringify(data.user));
    return data;
}

/**
 * Register a new user
 */
export async function registerUser({ name, email, password, studentId, role }) {
    return apiFetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password, studentId, role },
    });
}

/**
 * Get current user profile
 */
export async function getMe() {
    return apiFetch('/api/auth/me');
}

/**
 * Check if user is logged in
 */
export function isAuthenticated() {
    return !!localStorage.getItem('adiptify_token');
}

/**
 * Get stored user
 */
export function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('adiptify_user'));
    } catch {
        return null;
    }
}

/**
 * Logout
 */
export function logoutUser() {
    localStorage.removeItem('adiptify_token');
    localStorage.removeItem('adiptify_user');
}
