const BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Universal wrapper around fetch to talk to backend API.
 * Uses credentials: 'include' to handle HTTP-Only token cookies.
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Automatically pass credentials/cookies
  options.credentials = 'include';

  // Apply default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // If the body is FormData (for file uploads), let the browser handle boundary header
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  options.headers = headers;

  try {
    const response = await fetch(url, options);
    
    let result;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { success: response.ok, message: response.statusText, data: null };
    }

    if (!response.ok) {
      const errorMsg = result && result.message ? result.message : `HTTP error! Status: ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    // Forward the error if it has a status (already parsed API error)
    if (error.status) {
      throw error;
    }
    // Network or other unexpected errors
    console.error('API Request failed:', error);
    throw new Error(error.message || 'Network connection failed. Please check if server is running.');
  }
};
