import api from './api';

export interface VerifyAuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
    user?: {
      _id: string;
      email?: string;
      phone?: string;
      fullName?: string;
      role?: string;
    };
  };
}

export interface RegisterUserData {
  fullName: string;
  gender: 'Male' | 'Female';
  age: number;
  /** Date of birth, format YYYY-MM-DD (required by backend) */
  dob: string;
  /** Country name (required by backend) */
  country: string;
  /** Optional: 'google' when completing Google sign-up so backend can save auth provider to MongoDB */
  provider?: 'email' | 'google';
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      _id: string;
      email?: string;
      phone?: string;
      fullName: string;
      gender: string;
      age: number;
      role: string;
    };
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string; // Optional - backend may return new refresh token
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    email?: string;
    phone?: string;
    fullName?: string;
    gender?: string;
    age?: number;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Verify Firebase Auth Token (optionally pass provider so backend can save login data to MongoDB the same way for email and Google)
export const verifyFirebaseAuth = async (
  idToken: string,
  options?: { provider?: 'email' | 'google' }
): Promise<VerifyAuthResponse> => {
  try {
    console.log('📋 verifyFirebaseAuth called', options?.provider ? `(provider: ${options.provider})` : '');
    const body: { idToken: string; provider?: string } = { idToken };
    if (options?.provider) body.provider = options.provider;
    const response = await api.post<VerifyAuthResponse>('/v1/auth/verify', body);
    console.log('📥 verifyFirebaseAuth response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error verifying Firebase auth:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData: RegisterUserData): Promise<RegisterResponse> => {
  try {
    console.log('📋 registerUser called with data:', userData);
    const response = await api.post<RegisterResponse>('/v1/auth/register', userData);
    console.log('📥 registerUser response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error registering user:', error);
    console.error('❌ Register error details:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    
    // Log the full error for debugging
    if (error?.response?.data) {
      console.error('❌ Backend error response:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    console.log('📋 refreshAccessToken called');
    const response = await api.post<RefreshTokenResponse>('/v1/auth/refresh', {
      refreshToken,
    });
    console.log('📥 refreshAccessToken response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    throw error;
  }
};

// Logout
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    console.log('📋 logout called');
    await api.post('/v1/auth/logout', {
      refreshToken,
    });
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Error logging out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  try {
    console.log('📋 getCurrentUser called');
    const response = await api.get<CurrentUserResponse>('/v1/auth/me');
    console.log('📥 getCurrentUser response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    throw error;
  }
};
