// API Base URL — change to your deployed backend URL when hosting
const API_BASE_URL = 'http://localhost:8000';

/**
 * api.js — Shared API client for Finance Tracker
 * Handles fetch calls to the FastAPI backend with JWT auth.
 */

/**
 * Helper: authenticated fetch wrapper
 * @param {string} url - Relative path (e.g. '/api/auth/me')
 * @param {object} options - fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

/**
 * Register a new user
 * @param {object} data - { email, username, password, full_name }
 * @returns {Promise<object>}
 */
async function apiRegister(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Login with email + password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { access_token, token_type }
 */
async function apiLogin(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  return res.json();
}

/**
 * Get current user info
 * @returns {Promise<object>}
 */
async function apiGetMe() {
  const res = await authFetch('/api/auth/me');
  return res.json();
}

/**
 * Get all transactions (with optional filters)
 * @param {object} filters - { type, category, skip, limit }
 * @returns {Promise<object[]>}
 */
async function apiGetTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('transaction_type', filters.type);
  if (filters.category) params.set('category', filters.category);
  if (filters.skip) params.set('skip', filters.skip);
  if (filters.limit) params.set('limit', filters.limit);

  const qs = params.toString();
  const res = await authFetch(`/api/transactions/${qs ? '?' + qs : ''}`);
  return res.json();
}

/**
 * Create a new transaction
 * @param {object} data - { amount, category, description, transaction_type, transaction_date }
 * @returns {Promise<object>}
 */
async function apiCreateTransaction(data) {
  const res = await authFetch('/api/transactions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Update a transaction
 * @param {number} id
 * @param {object} data - partial fields to update
 * @returns {Promise<object>}
 */
async function apiUpdateTransaction(id, data) {
  const res = await authFetch(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Delete a transaction
 * @param {number} id
 * @returns {Promise<void>}
 */
async function apiDeleteTransaction(id) {
  await authFetch(`/api/transactions/${id}`, { method: 'DELETE' });
}

/**
 * Get summary stats
 * @returns {Promise<object>} { total_income, total_expenses, balance, transaction_count }
 */
async function apiGetSummaryStats() {
  const res = await authFetch('/api/transactions/summary/stats');
  return res.json();
}

/**
 * Get unique categories
 * @returns {Promise<string[]>}
 */
async function apiGetCategories() {
  const res = await authFetch('/api/transactions/categories/list');
  const data = await res.json();
  return data.categories;
}

// Expose on window for inline scripts in HTML pages
window.API = {
  API_BASE_URL,
  register: apiRegister,
  login: apiLogin,
  getMe: apiGetMe,
  getTransactions: apiGetTransactions,
  createTransaction: apiCreateTransaction,
  updateTransaction: apiUpdateTransaction,
  deleteTransaction: apiDeleteTransaction,
  getSummaryStats: apiGetSummaryStats,
  getCategories: apiGetCategories,
  authFetch,
};