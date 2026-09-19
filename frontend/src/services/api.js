/**
 * Base API Client for NoteRecall
 * Handles proxy communication with FastAPI backend (/api/v1)
 * Adheres to Error Handling Standard in docs/ARCHITECTURE.md
 */

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  constructor(message, status, detail, errorCode) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail || message;
    this.errorCode = errorCode;
  }
}

/**
 * Universal fetch wrapper with JSON serialization and robust error extraction
 */
export async function apiRequest(endpoint, options = {}, fallbackData = null) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const fetchOptions = {
    ...options,
    headers,
  };

  if (options.body && !options.isFormData && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // If endpoint fails or is not yet ready on backend and we have contract fallback data,
      // return fallback data for uninterrupted parallel frontend development
      if (fallbackData !== null) {
        console.warn(`[API Proxy] ${endpoint} returned ${response.status}. Using contract fallback mock data.`);
        return fallbackData;
      }

      const detail = (typeof data === 'object' && data?.detail) ? data.detail : `Request failed with status ${response.status}`;
      const errorCode = typeof data === 'object' ? data?.error_code : undefined;
      throw new ApiError(detail, response.status, detail, errorCode);
    }

    return data;
  } catch (error) {
    // If backend connection fails or errors and fallback exists, return fallback
    if (fallbackData !== null) {
      console.warn(`[API Proxy] ${endpoint} threw (${error.message}). Using contract fallback mock data.`);
      return fallbackData;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'Network error occurred. Please check backend connection.',
      0,
      error.message
    );
  }
}
