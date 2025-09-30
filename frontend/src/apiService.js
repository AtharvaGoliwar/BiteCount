// src/apiService.js

const BASE_URL = import.meta.env.VITE_API_URL; // Your Flask backend URL

/**
 * A helper function for making API requests with fetch.
 * It automatically adds the auth token and handles response parsing and errors.
 */
async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('x-access-token', token);
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  // If the response is not OK (status is not 2xx), parse the error and throw it.
  if (!response.ok) {
    // Try to get a meaningful error message from the response body
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // The body was not JSON or was empty
    }
    throw new Error(errorMessage);
  }

  // If the response is successful, parse the JSON body and return it.
  // Handle cases where there might be no content (e.g., a 204 response).
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return {}; // Return empty object for non-json responses
}

export default apiFetch;