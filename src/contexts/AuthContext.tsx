import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { verifyFirebaseAuth, registerUser, getCurrentUser, logout as apiLogout, CurrentUserResponse } from '../services/authApi';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userProfile: CurrentUserResponse['data'] | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, gender: 'Male' | 'Female', age: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<CurrentUserResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get ID token and verify with backend
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log('🔑 Got Firebase ID token' , idToken);
          
          // Verify token with backend
          const verifyResponse = await verifyFirebaseAuth(idToken);
          console.log('✅ Auth verification response:', verifyResponse);
          
          // Store tokens
          if (verifyResponse.data.accessToken) {
            localStorage.setItem('accessToken', verifyResponse.data.accessToken);
            localStorage.setItem('refreshToken', verifyResponse.data.refreshToken);
            console.log('✅ Tokens stored in localStorage');
          }
          
          // If user profile exists, fetch it
          if (!verifyResponse.data.isNewUser && verifyResponse.data.user) {
            console.log('👤 Existing user, fetching profile...');
            await refreshUserProfile();
          } else if (verifyResponse.data.isNewUser) {
            console.log('🆕 New user detected, registration required');
          }
        } catch (error: any) {
          console.error('❌ Error verifying auth:', error);
          console.error('❌ Error details:', {
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
            status: error?.response?.status,
          });
          toast.error(error?.response?.data?.message || 'Failed to verify authentication');
        }
      } else {
        // Clear tokens when logged out
        console.log('🚪 User logged out, clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase login successful:', userCredential.user.uid);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('🔑 Got ID token for verification');
      
      // Verify with backend
      const verifyResponse = await verifyFirebaseAuth(idToken);
      console.log('✅ Backend verification successful:', verifyResponse);
      
      // Store tokens
      if (verifyResponse.data.accessToken) {
        localStorage.setItem('accessToken', verifyResponse.data.accessToken);
        localStorage.setItem('refreshToken', verifyResponse.data.refreshToken);
        console.log('✅ Tokens stored');
      }
      
      // If new user, they need to register
      if (verifyResponse.data.isNewUser) {
        console.log('🆕 New user, redirecting to registration');
        toast.info('Please complete your registration');
        return;
      }
      
      // Fetch user profile
      console.log('👤 Fetching user profile...');
      await refreshUserProfile();
      toast.success('Login successful');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Login error details:', {
        code: error?.code,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'User not found'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/user-disabled'
        ? 'User account has been disabled'
        : error?.response?.data?.message
        ? error.response.data.message
        : error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    gender: 'Male' | 'Female',
    age: number
  ) => {
    try {
      console.log('📝 Registering user:', { email, fullName, gender, age });
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase registration successful:', userCredential.user.uid);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('🔑 Got ID token for verification');
      
      // Verify with backend (to get temporary token)
      const verifyResponse = await verifyFirebaseAuth(idToken);
      console.log('✅ Backend verification response:', verifyResponse);
      
      // If user already exists, try to fetch profile instead
      if (!verifyResponse.data.isNewUser) {
        console.log('ℹ️ User already exists in backend, fetching profile...');
        
        // Store tokens
        if (verifyResponse.data.accessToken) {
          localStorage.setItem('accessToken', verifyResponse.data.accessToken);
          localStorage.setItem('refreshToken', verifyResponse.data.refreshToken);
        }
        
        // Fetch user profile
        await refreshUserProfile();
        toast.success('Account already exists. Logged in successfully.');
        return;
      }
      
      // Store temporary token
      if (verifyResponse.data.accessToken) {
        localStorage.setItem('accessToken', verifyResponse.data.accessToken);
        console.log('✅ Temporary token stored');
      }
      
      // Register with backend
      console.log('📝 Registering user with backend...');
      const registerResponse = await registerUser({
        fullName,
        gender,
        age,
      });
      console.log('✅ Backend registration successful:', registerResponse);
      
      // Store final tokens
      if (registerResponse.data.accessToken) {
        localStorage.setItem('accessToken', registerResponse.data.accessToken);
        localStorage.setItem('refreshToken', registerResponse.data.refreshToken);
        console.log('✅ Final tokens stored');
      }
      
      // Set user profile
      setUserProfile(registerResponse.data.user);
      console.log('✅ User profile set:', registerResponse.data.user);
      toast.success('Registration successful');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Registration error details:', {
        code: error?.code,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack,
      });
      
      // Handle Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please login instead.');
        throw error;
      }
      
      // Handle backend API errors
      if (error?.response?.status === 409) {
        const backendError = error?.response?.data;
        console.error('❌ Backend conflict error:', backendError);
        
        // Check if it's a duplicate key error
        if (backendError?.message?.includes('duplicate') || backendError?.message?.includes('Duplicate')) {
          toast.error('This account already exists. Please try logging in instead.');
        } else {
          toast.error(backendError?.message || 'Account already exists. Please login.');
        }
        throw error;
      }
      
      // Handle other errors
      const errorMessage = error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/weak-password'
        ? 'Password is too weak'
        : error?.response?.data?.message
        ? error.response.data.message
        : error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out');
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await apiLogout(refreshToken);
        } catch (error) {
          console.error('Error calling logout API:', error);
        }
      }
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUserProfile(null);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error('Logout failed');
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      console.log('👤 Fetching current user profile...');
      const response = await getCurrentUser();
      setUserProfile(response.data);
      console.log('✅ User profile refreshed:', response.data);
    } catch (error: any) {
      console.error('❌ Error refreshing user profile:', error);
      console.error('❌ Profile error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user && !!userProfile,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
