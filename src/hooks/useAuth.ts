import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  updateProfile,
  deleteAccount,
  setAnonymous,
  upgradeToProAccount,
  refreshAuthToken
} from '../store/slices/authSlice';
import { User, AuthProvider } from '../types/models';

export interface UseAuthReturn {
  // State
  user: User | null;
  isLoggedIn: boolean;
  isAnonymous: boolean;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  familyId: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: AuthProvider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  setAnonymousMode: (enabled: boolean) => void;
  upgradeToProAccount: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Computed values
  canUpgradeToPro: boolean;
  hasActiveSubscription: boolean;
  subscriptionExpiry: Date | null;
  remainingTrialDays: number;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Computed values
  const canUpgradeToPro = !authState.isPro && !authState.isAnonymous;
  const hasActiveSubscription = authState.isPro && authState.user?.subscriptionExpiry ? 
    new Date(authState.user.subscriptionExpiry) > new Date() : false;
  
  const subscriptionExpiry = authState.user?.subscriptionExpiry ? 
    new Date(authState.user.subscriptionExpiry) : null;
    
  const remainingTrialDays = authState.user?.trialEndsAt ? 
    Math.max(0, Math.ceil((new Date(authState.user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  // Sign in with email and password
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsProcessing(true);
    try {
      await dispatch(signIn({ email, password })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Sign up with email and password
  const handleSignUp = useCallback(async (email: string, password: string, name: string) => {
    setIsProcessing(true);
    try {
      await dispatch(signUp({ email, password, displayName: name })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Sign out
  const handleSignOut = useCallback(async () => {
    setIsProcessing(true);
    try {
      await dispatch(signOut()).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Sign in with third-party providers
  const handleSignInWithProvider = useCallback(async (provider: AuthProvider) => {
    setIsProcessing(true);
    try {
      // Implementation would depend on the specific provider
      switch (provider) {
        case 'google':
          // await dispatch(signInWithGoogle()).unwrap();
          break;
        case 'apple':
          // await dispatch(signInWithApple()).unwrap();
          break;
        case 'facebook':
          // await dispatch(signInWithFacebook()).unwrap();
          break;
        default:
          throw new Error(`Provider ${provider} not supported`);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Reset password
  const handleResetPassword = useCallback(async (email: string) => {
    setIsProcessing(true);
    try {
      await dispatch(resetPassword({ email })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Update user profile
  const handleUpdateProfile = useCallback(async (updates: Partial<User>) => {
    setIsProcessing(true);
    try {
      await dispatch(updateProfile(updates)).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Delete account
  const handleDeleteAccount = useCallback(async () => {
    setIsProcessing(true);
    try {
      await dispatch(deleteAccount()).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Set anonymous mode
  const handleSetAnonymousMode = useCallback((enabled: boolean) => {
    dispatch(setAnonymous(enabled));
  }, [dispatch]);

  // Upgrade to Pro account
  const handleUpgradeToProAccount = useCallback(async () => {
    setIsProcessing(true);
    try {
      await dispatch(upgradeToProAccount()).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Refresh authentication token
  const handleRefreshToken = useCallback(async () => {
    try {
      await dispatch(refreshAuthToken()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authState.user?.tokenExpiry) return;

    const tokenExpiry = new Date(authState.user.tokenExpiry);
    const now = new Date();
    const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

    const refreshTimer = setTimeout(() => {
      handleRefreshToken().catch(console.error);
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [authState.user?.tokenExpiry, handleRefreshToken]);

  // Check subscription expiry
  useEffect(() => {
    if (!subscriptionExpiry || !hasActiveSubscription) return;

    const now = new Date();
    const daysUntilExpiry = Math.ceil((subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Show expiry warning 7 days before expiry
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      // Could dispatch a notification or warning here
      console.warn(`Subscription expires in ${daysUntilExpiry} days`);
    }
  }, [subscriptionExpiry, hasActiveSubscription]);

  return {
    // State
    user: authState.user,
    isLoggedIn: !!authState.user && !authState.isAnonymous,
    isAnonymous: authState.isAnonymous,
    isPro: authState.isPro,
    isLoading: authState.loading || isProcessing,
    error: authState.error,
    familyId: authState.familyId,
    
    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithProvider: handleSignInWithProvider,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    deleteAccount: handleDeleteAccount,
    setAnonymousMode: handleSetAnonymousMode,
    upgradeToProAccount: handleUpgradeToProAccount,
    refreshToken: handleRefreshToken,
    
    // Computed values
    canUpgradeToPro,
    hasActiveSubscription,
    subscriptionExpiry,
    remainingTrialDays,
  };
};
