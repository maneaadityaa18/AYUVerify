import axios, { AxiosError } from 'axios';

// Get base URL from environment variables, following Vite conventions
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor: Attach Auth Token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ayurverify_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Structure for Backend Error Response
interface BackendErrorDetail {
  code?: string;
  message?: string;
}

interface BackendErrorResponse {
  detail?: string | BackendErrorDetail;
}

// Error Mapper Catalog
const HTTP_ERROR_MAP: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'Some fields are invalid. Please review the highlighted fields.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our server. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again in a few minutes.',
  503: 'The server is temporarily unavailable. Please try again in a few minutes.',
  504: 'The server is temporarily unavailable. Please try again in a few minutes.',
};

const CODE_ERROR_MAP: Record<string, string> = {
  BATCH_NOT_TRANSFERABLE: 'This batch cannot be transferred in its current state.',
  RECIPIENT_NOT_FOUND: 'The selected recipient could not be found.',
  RECIPIENT_ROLE_INVALID: 'The selected recipient is not valid for this transfer.',
  TRANSFER_ALREADY_ACCEPTED: 'This transfer has already been accepted.',
  EMAIL_ALREADY_REGISTERED: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Incorrect email or password.',
};

/**
 * Parses axios error and extracts friendly user-facing message
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const axiosError = error as AxiosError<BackendErrorResponse>;

  // Handle network failure
  if (!axiosError.response) {
    return 'Unable to connect to AyurVerify server. Please check your connection and try again.';
  }

  const status = axiosError.response.status;
  const data = axiosError.response.data;

  // Check for structured backend error code
  if (data && typeof data === 'object' && data.detail) {
    const detail = data.detail;
    if (typeof detail === 'object' && detail.code) {
      const code = detail.code;
      if (CODE_ERROR_MAP[code]) {
        return CODE_ERROR_MAP[code];
      }
      if (detail.message) {
        return detail.message;
      }
    } else if (typeof detail === 'string') {
      return detail;
    }
  }

  // Fallback to HTTP status mapping
  return HTTP_ERROR_MAP[status] || 'An error occurred while processing your request. Please try again.';
}

// Response Interceptor: Global Error Logger
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging as required by Section 84.3
    console.error('[API Error Logger]:', error);
    
    // Auto-logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('ayurverify_token');
      // In later phases we will trigger auth redirect here
    }
    
    return Promise.reject(error);
  }
);
