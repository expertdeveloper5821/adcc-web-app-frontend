import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { verifyFirebaseAuth, registerUser, getCurrentUser, logout as apiLogout, CurrentUserResponse } from '../services/authApi';
import { toast } from 'sonner';
import i18n from '../i18n';

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
  // Flag to prevent duplicate verification when handling auth manually
  const isHandlingAuthManually = useRef(false);
  // Flag to track if this is the initial mount (page reload)
  const isInitialMount = useRef(true);

  // Function to refresh user profile (defined early so it can be used in useEffect)
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Skip verification if we're handling auth manually (login/register)
        if (isHandlingAuthManually.current) {
          console.log('⏭️ Skipping verification - handling auth manually');
          setLoading(false);
          isInitialMount.current = false;
          return;
        }
        
        // On page reload: Don't call verify API, just load profile if tokens exist
        // This prevents creating new refresh tokens on every page reload
        if (isInitialMount.current) {
          console.log('🔄 Page reload detected - skipping verify API call');
          const existingAccessToken = localStorage.getItem('accessToken');
          const existingRefreshToken = localStorage.getItem('refreshToken');
          
          if (existingAccessToken && existingRefreshToken) {
            console.log('✅ Tokens found in localStorage - loading user profile');
            try {
              // Just load the user profile using existing tokens
              // The API interceptor will handle token refresh if needed
              await refreshUserProfile();
              console.log('✅ User profile loaded from existing tokens');
            } catch (error: any) {
              console.error('❌ Error loading user profile:', error);
              // If profile load fails (e.g., tokens expired), clear and let user login again
              if (error?.response?.status === 401) {
                console.log('⚠️ Tokens expired - clearing storage');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUserProfile(null);
                toast.error(i18n.t('auth.toasts.sessionExpired'));
              }
            }
          } else {
            console.log('⚠️ No tokens found in localStorage');
            // No tokens found - user needs to login
            setUserProfile(null);
          }
          isInitialMount.current = false;
          setLoading(false);
          return;
        }
        
        // This code should not run in normal flow, but kept as fallback
        // Only runs if onAuthStateChanged fires unexpectedly (shouldn't happen)
        console.warn('⚠️ Unexpected auth state change - verifying with backend');
        try {
          const idToken = await firebaseUser.getIdToken();
          const verifyResponse = await verifyFirebaseAuth(idToken);
          
          if (verifyResponse.data.accessToken) {
            localStorage.setItem('accessToken', verifyResponse.data.accessToken);
            localStorage.setItem('refreshToken', verifyResponse.data.refreshToken);
          }
          
          if (!verifyResponse.data.isNewUser && verifyResponse.data.user) {
            await refreshUserProfile();
          } else if (verifyResponse.data.isNewUser) {
            toast.info(i18n.t('auth.toasts.completeRegistration'));
          }
        } catch (error: any) {
          console.error('❌ Error verifying auth:', error);
          toast.error(error?.response?.data?.message || i18n.t('auth.toasts.verifyFailed'));
        }
      } else {
        // Clear tokens when logged out
        console.log('🚪 User logged out, clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserProfile(null);
      }
      
      setLoading(false);
      isInitialMount.current = false;
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in with email:', email);
      isHandlingAuthManually.current = true;
      
      // Sign in with Firebase - this will trigger onAuthStateChanged
      // but we'll skip verification there since we're handling it manually
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase login successful');
      
      // Get ID token and verify with backend
      const idToken = await userCredential.user.getIdToken();
      // console.log('🔑 Got ID token for verification' , idToken);
      
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
        toast.info(i18n.t('auth.toasts.completeRegistration'));
        isHandlingAuthManually.current = false;
        return;
      }
      
      // Fetch user profile
      console.log('👤 Fetching user profile...');
      await refreshUserProfile();
      toast.success(i18n.t('auth.toasts.loginSuccess'));
      isHandlingAuthManually.current = false;
    } catch (error: any) {
      isHandlingAuthManually.current = false;
      console.error('❌ Login error:', error);
      console.error('❌ Login error details:', {
        code: error?.code,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      const errorMessage = error.code === 'auth/user-not-found'
        ? i18n.t('auth.toasts.userNotFound')
        : error.code === 'auth/wrong-password'
        ? i18n.t('auth.toasts.incorrectPassword')
        : error.code === 'auth/invalid-email'
        ? i18n.t('auth.toasts.invalidEmail')
        : error.code === 'auth/user-disabled'
        ? i18n.t('auth.toasts.accountDisabled')
        : error?.response?.data?.message
        ? error.response.data.message
        : error.message || i18n.t('auth.toasts.loginFailed');
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
      isHandlingAuthManually.current = true;
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase registration successful:', userCredential.user.uid);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('🔑 Got ID token for verification', idToken);
      
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
        toast.success(i18n.t('auth.toasts.accountExistsLoggedIn'));
        isHandlingAuthManually.current = false;
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
      setUserProfile(registerResponse.data.user as any);
      console.log('✅ User profile set:', registerResponse.data.user);
      toast.success(i18n.t('auth.toasts.registrationSuccess'));
      isHandlingAuthManually.current = false;
    } catch (error: any) {
      isHandlingAuthManually.current = false;
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
        toast.error(i18n.t('auth.toasts.emailInUse'));
        throw error;
      }
      
      // Handle backend API errors
      if (error?.response?.status === 409) {
        const backendError = error?.response?.data;
        console.error('❌ Backend conflict error:', backendError);
        
        // Check if it's a duplicate key error
        if (backendError?.message?.includes('duplicate') || backendError?.message?.includes('Duplicate')) {
          toast.error(i18n.t('auth.toasts.accountExists'));
        } else {
          toast.error(backendError?.message || i18n.t('auth.toasts.accountExistsLogin'));
        }
        throw error;
      }
      
      // Handle other errors
      const errorMessage = error.code === 'auth/invalid-email'
        ? i18n.t('auth.toasts.invalidEmail')
        : error.code === 'auth/weak-password'
        ? i18n.t('auth.toasts.weakPassword')
        : error?.response?.data?.message
        ? error.response.data.message
        : error.message || i18n.t('auth.toasts.registrationFailed');
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
      
      toast.success(i18n.t('auth.toasts.logoutSuccess'));
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error(i18n.t('auth.toasts.logoutFailed'));
      throw error;
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
