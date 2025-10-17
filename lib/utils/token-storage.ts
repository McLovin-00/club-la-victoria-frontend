/**
 * Token Storage Abstraction
 * Provides a secure interface for storing and retrieving authentication tokens
 */

const TOKEN_KEY = 'authToken';

/**
 * Check if we're running in the browser
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Store authentication token securely
 * @param token - JWT token to store
 */
export const setToken = (token: string): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

/**
 * Retrieve authentication token
 * @returns Token string or null if not found
 */
export const getToken = (): string | null => {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove authentication token (logout)
 */
export const removeToken = (): void => {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if user is authenticated (has valid token)
 * Note: This only checks existence, not validity
 * @returns true if token exists
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Clear all authentication data
 * Use this for full logout/cleanup
 */
export const clearAuthData = (): void => {
  removeToken();
  // Add any other auth-related cleanup here in the future
  // e.g., clearing user preferences, cached data, etc.
};
