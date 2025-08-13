import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import SplashScreen from 'react-native-splash-screen'; // Tymczasowo wyłączony
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NetInfo from '@react-native-community/netinfo';

import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeFirebase } from './src/services/firebase/config';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { setOnlineStatus } from './src/store/slices/productsSlice';

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Konfiguracja Google Sign In
        GoogleSignin.configure({
          webClientId: '569311507320-mr2rs1qd3u4hqcdib4cj13fdosnb78hc.apps.googleusercontent.com',
        });

        // Inicjalizacja Firebase
        await initializeFirebase();

        // Nasłuchiwanie stanu połączenia
        const unsubscribe = NetInfo.addEventListener(state => {
          store.dispatch(setOnlineStatus(state.isConnected ?? false));
        });

        // Ukryj splash screen
        // SplashScreen.hide(); // Tymczasowo wyłączony

        return () => unsubscribe();
      } catch (error) {
        console.error('App initialization error:', error);
        // SplashScreen.hide(); // Tymczasowo wyłączony
      }
    };

    initApp();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;