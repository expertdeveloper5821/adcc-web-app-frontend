import axios from 'axios';

// Create axios instance with base configuration
const BASE_URL = 'https://adcc-b4f3.onrender.com';
console.log('🔧 API Configuration:', {
  baseURL: BASE_URL,
  timestamp: new Date().toISOString(),
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
      headers: config.headers,
    });
    
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Auth Token:', token ? 'Token found' : 'No token found');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Response:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      fullError: error,
    });
    
    // Handle payload too large error
    if (error.response?.status === 413 || 
        error.message?.includes('PayloadTooLargeError') || 
        error.message?.includes('request entity too large')) {
      console.error('⚠️ Payload Too Large - Request body exceeds server limit');
      error.isPayloadTooLarge = true;
    }
    
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - Removing token');
      // Handle unauthorized access
      localStorage.removeItem('accessToken');
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

export default api;
