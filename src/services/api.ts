import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { refreshAccessToken } from './authApi';

// Create axios instance with base configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// console.log('🔧 API Configuration:', {
//   baseURL: BASE_URL,
//   timestamp: new Date().toISOString(),
// });

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to decode JWT token and get expiration time
const getTokenExpiration = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    // 🔍 DEBUGGER POINT 1: Check decoded token expiration
    // debugger; // Uncomment to debug token decoding
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

// Check if token is about to expire (within 30 seconds)
const isTokenExpiringSoon = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  const now = Date.now();
  const timeUntilExpiration = expiration - now;
  const thirtySeconds = 30 * 1000;
  
  // 🔍 DEBUGGER POINT 2: Check token expiration calculation
  // debugger; // Uncomment to debug expiration check
  // Check variables: expiration, now, timeUntilExpiration, thirtySeconds
  
  return timeUntilExpiration <= thirtySeconds && timeUntilExpiration > 0;
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to logout user (called when refresh token is expired)
const logoutUser = async () => {
  console.log('🚪 Refresh token expired - Logging out user...');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Clear Firebase auth if available (using dynamic import)
  try {
    const { auth } = await import('../config/firebase');
    if (auth) {
      auth.signOut().catch(() => {
        // Ignore Firebase signout errors
      });
    }
  } catch (e) {
    // Firebase not available or import failed, continue with logout
    console.log('Firebase auth not available, continuing logout');
  }
  
  // Redirect to login page
  if (window.location.pathname !== '/login' && window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
};

// Function to refresh token
const refreshToken = async (): Promise<string | null> => {
  // 🔍 DEBUGGER POINT 3: Entry point for token refresh
  // debugger; // Uncomment to debug refresh start
  
  if (isRefreshing) {
    // If already refreshing, wait for it to complete
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  const refreshTokenValue = localStorage.getItem('refreshToken');

  if (!refreshTokenValue) {
    console.warn('⚠️ No refresh token available');
    // 🔍 DEBUGGER POINT 4: No refresh token available
    // debugger; // Uncomment to debug missing refresh token
    isRefreshing = false;
    processQueue(new Error('No refresh token'), null);
    logoutUser();
    return null;
  }

  // Check if refresh token is expired
  const refreshTokenExpiration = getTokenExpiration(refreshTokenValue);
  if (refreshTokenExpiration && refreshTokenExpiration < Date.now()) {
    console.error('❌ Refresh token has expired');
    // 🔍 DEBUGGER POINT 4.5: Refresh token expired
    // debugger; // Uncomment to debug expired refresh token
    isRefreshing = false;
    processQueue(new Error('Refresh token expired'), null);
    logoutUser();
    return null;
  }

  try {
    console.log('🔄 Refreshing access token...');
    // 🔍 DEBUGGER POINT 5: Before API call to refresh token
    // debugger; // Uncomment to debug before refresh API call
    const response = await refreshAccessToken(refreshTokenValue);
    
    // 🔍 DEBUGGER POINT 6: After successful refresh API call
    // debugger; // Uncomment to debug refresh response
    // Check: response.data.accessToken
    
    if (response.data.accessToken) {
      // Remove old tokens before storing new ones
      localStorage.removeItem('accessToken');
      if (response.data.refreshToken) {
        localStorage.removeItem('refreshToken');
      }
      
      // Store new access token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('✅ Access token refreshed successfully and stored in localStorage');
      
      // Store new refresh token if provided by backend
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
        console.log('✅ Refresh token updated and stored in localStorage');
      } else {
        console.log('ℹ️ No new refresh token returned - keeping existing refresh token');
      }
      
      isRefreshing = false;
      processQueue(null, response.data.accessToken);
      return response.data.accessToken;
    }
    
    throw new Error('No access token in refresh response');
  } catch (error: any) {
    // 🔍 DEBUGGER POINT 7: Error during token refresh
    // debugger; // Uncomment to debug refresh errors
    // Check: error, error.response, error.message
    
    console.error('❌ Error refreshing token:', error);
    
    // Check if error message indicates refresh token is expired
    const errorMessage = error?.response?.data?.message || error?.message || '';
    const isRefreshTokenExpired = 
      errorMessage.toLowerCase().includes('invalid') && 
      errorMessage.toLowerCase().includes('expired') ||
      errorMessage.toLowerCase().includes('refresh token expired') ||
      error?.response?.status === 401;
    
    if (isRefreshTokenExpired) {
      console.error('❌ Refresh token is expired or invalid - Logging out user');
      logoutUser();
    } else {
      // For other errors, just clear tokens but don't logout (might be network error)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    
    isRefreshing = false;
    processQueue(error, null);
    throw error;
  }
};


// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token refresh for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/refresh') || 
                          config.url?.includes('/auth/verify') ||
                          config.url?.includes('/auth/login');
    
    if (!isAuthEndpoint) {
      let token = localStorage.getItem('accessToken');
      
      // 🔍 DEBUGGER POINT 11: Before API request - check token expiration
      // debugger; // Uncomment to debug request interceptor
      // Check: config.url, token, isTokenExpiringSoon(token)
      
      // Check if token is expiring soon and refresh if needed
      if (token && isTokenExpiringSoon(token)) {
        console.log('⏰ Token expiring soon in request, refreshing...');
        try {
          token = await refreshToken();
        } catch (error) {
          console.error('❌ Failed to refresh token in request:', error);
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For auth endpoints, still add token if available (except refresh endpoint)
      const token = localStorage.getItem('accessToken');
      if (token && !config.url?.includes('/auth/refresh')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
      hasAuth: !!config.headers.Authorization,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.error('❌ API Error Response:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      data: error.response?.data,
    });
    
    // Handle payload too large error
    if (error.response?.status === 413 || 
        error.message?.includes('PayloadTooLargeError') || 
        error.message?.includes('request entity too large')) {
      console.error('⚠️ Payload Too Large - Request body exceeds server limit');
      (error as any).isPayloadTooLarge = true;
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized - check for "Invalid or expired token" message
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // 🔍 DEBUGGER POINT 12: 401 Unauthorized error - before refresh attempt
      // debugger; // Uncomment to debug 401 error handling
      // Check: error.response.status, originalRequest.url, error.response.data.message
      
      const errorMessage = (error.response?.data as any)?.message || (error as any).message || '';
      const isTokenExpiredError = 
        errorMessage.toLowerCase().includes('invalid') && 
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('invalid or expired token') ||
        errorMessage.toLowerCase().includes('token expired');
      
      // Skip refresh for auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') || 
                            originalRequest.url?.includes('/auth/verify') ||
                            originalRequest.url?.includes('/auth/login');
      
      if (isAuthEndpoint) {
        console.warn('⚠️ Unauthorized on auth endpoint - clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }
      
      // Only refresh token if error message indicates token expiration
      if (isTokenExpiredError || error.response?.status === 401) {
        originalRequest._retry = true;
        
        try {
          console.log('🔄 401 Unauthorized - Invalid or expired token detected. Attempting to refresh token...');
          // 🔍 DEBUGGER POINT 13: Before refreshing token on 401 error
          // debugger; // Uncomment to debug 401 refresh attempt
          const newToken = await refreshToken();
          
          // 🔍 DEBUGGER POINT 14: After successful refresh on 401 error
          // debugger; // Uncomment to debug after 401 refresh success
          // Check: newToken, originalRequest
          
          if (newToken && originalRequest.headers) {
            // Store new token in localStorage (already done in refreshToken function)
            // Update request header with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed and stored. Retrying original request...');
            return api(originalRequest);
          } else {
            // If refresh failed, logout user (handled in refreshToken function)
            console.error('❌ Failed to get new token after refresh');
            return Promise.reject(new Error('Failed to refresh token'));
          }
        } catch (refreshError: unknown) {
          // 🔍 DEBUGGER POINT 15: Error refreshing token on 401 error
          // debugger; // Uncomment to debug 401 refresh error
          // Check: refreshError, refreshError.response
          
          const error = refreshError as any;
          console.error('❌ Failed to refresh token:', error);
          
          // Check if refresh token itself is expired
          const refreshErrorMessage = error?.response?.data?.message || error?.message || '';
          const isRefreshTokenExpired = 
            refreshErrorMessage.toLowerCase().includes('invalid') && 
            refreshErrorMessage.toLowerCase().includes('expired') ||
            refreshErrorMessage.toLowerCase().includes('refresh token expired') ||
            error?.response?.status === 401;
          
          if (isRefreshTokenExpired) {
            console.error('❌ Refresh token is also expired - Logging out user');
            await logoutUser();
          } else {
            // For other errors, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/auth') {
              window.location.href = '/auth';
            }
          }
          
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
