import React, { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, NavigationContainerRef, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus, Platform, PermissionsAndroid, useColorScheme } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@store/store';
import AppNavigator from '@navigation/AppNavigator';
import { initializeFirebase } from '@services/firebase/config';
import ErrorBoundary from '@components/common/ErrorBoundary';
import LoadingScreen from '@components/common/LoadingScreen';
import InitializationErrorScreen from '@components/common/InitializationErrorScreen';
import { ThemeProvider } from '@/context/ThemeContext';
import { 
  setOnlineStatus, 
  syncPendingChanges, 
  saveLocalState 
} from '@store/slices/productsSlice';
import { APP_CONFIG } from '@/config/app.config';
// Use a broad type for navigator ref to avoid mismatch with local navigator types
import { DefaultTheme, DarkTheme } from '@/themes';

// persistor provided by store

// Deep linking configuration
const linking: LinkingOptions<any> = {
  prefixes: ['sprytnaspizarnia://', 'https://sprytnaspizarnia.pl'],
  config: {
    screens: {
    AuthStack: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
    MainStack: {
        screens: {
      HomeTab: 'home',
      ProductDetails: 'product/:id',
      RecipeDetails: 'recipe/:id',
      ShoppingLists: 'shopping',
      Settings: 'settings',
      FamilyDetails: 'family',
        },
      },
    },
  },
};

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string>();
  const colorScheme = useColorScheme();
  const appInitTrace = useRef(perf().newTrace('app_initialization'));

  // Request permissions (Android)
  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
        
        // Log permission results
        Object.entries(granted).forEach(([permission, result]) => {
          analytics().logEvent('permission_request', {
            permission,
            granted: result === PermissionsAndroid.RESULTS.GRANTED,
          });
        });
      } catch (error) {
        console.warn('Permission request error:', error);
      }
    }
  };

  // Initialize app
  const initApp = async () => {
    try {
      // Start performance trace
      await appInitTrace.current.start();
      
      // Configure Google Sign In
      GoogleSignin.configure({
        webClientId: APP_CONFIG.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });

      // Initialize Firebase
      await initializeFirebase();

      // Request permissions
      await requestAndroidPermissions();

      // Enable Crashlytics in production
      if (!__DEV__) {
        await crashlytics().setCrashlyticsCollectionEnabled(true);
      }

      // Setup network listener
      const unsubscribeNetInfo = NetInfo.addEventListener(state => {
        store.dispatch(setOnlineStatus(state.isConnected ?? false));
        
        // Auto-sync when coming back online
        if (state.isConnected && state.isInternetReachable) {
          store.dispatch(syncPendingChanges());
        }
      });

      // Setup app state listener
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // App has come to the foreground
          store.dispatch(syncPendingChanges());
          analytics().logEvent('app_foreground');
        } else if (nextAppState === 'background') {
          // App has gone to the background
          store.dispatch(saveLocalState());
          analytics().logEvent('app_background');
        }
      };

      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

      // Mark initialization as complete
      setIsInitialized(true);
      setInitError(null);
      
      // Stop performance trace
      await appInitTrace.current.stop();
      
      // Log successful initialization
      analytics().logEvent('app_initialized', {
        initialization_time: await appInitTrace.current.getAttribute('duration'),
      });

      // Hide splash screen
      SplashScreen.hide();

      // Return cleanup function
      return () => {
        unsubscribeNetInfo();
        appStateSubscription.remove();
      };
    } catch (error) {
      const err = error as Error;
      console.error('App initialization error:', err);
      
      // Log error to Crashlytics
      crashlytics().recordError(err);
      
      // Update performance trace with error
      appInitTrace.current.putAttribute('error', err.message);
      await appInitTrace.current.stop();
      
      setInitError(err);
      setIsInitialized(true);
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    initApp().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  // Track screen views for analytics
  const onNavigationStateChange = async () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName && currentRouteName) {
      await analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }

    routeNameRef.current = currentRouteName;
  };

  // Error boundary with Crashlytics integration
  const ErrorBoundaryWithCrashlytics: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log to Crashlytics
          crashlytics().recordError(error, errorInfo?.componentStack ?? undefined);
          
          // Log to Analytics
          analytics().logEvent('app_crash', {
            error_message: error.message,
            component_stack: errorInfo.componentStack,
          });
        }}
  fallback={(error, retry) => (
          <InitializationErrorScreen 
            error={error} 
            onRetry={retry}
            showSupport={true}
          />
        )}
      >
        {children}
      </ErrorBoundary>
    );
  };

  // Show error screen if initialization failed
  if (initError) {
    return (
      <InitializationErrorScreen 
        error={initError} 
        onRetry={() => {
          setInitError(null);
          setIsInitialized(false);
          initApp();
        }}
      />
    );
  }

  // Show loading screen while initializing
  if (!isInitialized) {
    return <LoadingScreen message="Inicjalizacja aplikacji..." />;
  }

  return (
    <ErrorBoundaryWithCrashlytics>
      <Provider store={store}>
        <PersistGate 
          loading={<LoadingScreen message="Ładowanie danych..." />} 
          persistor={persistor}
        >
          <ThemeProvider colorScheme={colorScheme}>
            <SafeAreaProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linking}
                theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
                onStateChange={onNavigationStateChange}
                onReady={() => {
                  routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
                }}
              >
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundaryWithCrashlytics>
  );
};

export default App;