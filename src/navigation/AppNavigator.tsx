import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
// import SplashScreen from 'react-native-splash-screen'; // Tymczasowo wyłączony

import { RootState, AppDispatch } from '../store/store';
import { checkAuthStatus, signInAnonymously } from '../store/slices/authSlice';
import BottomTabNavigator from './BottomTabNavigator';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import RecipeDetailsScreen from '../screens/RecipeDetailsScreen';
import FamilyManagementScreen from '../screens/FamilyManagementScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import LoadingScreen from '../screens/LoadingScreen';

export type RootStackParamList = {
  Main: undefined;
  AddProduct: { barcode?: string } | undefined;
  ProductDetails: { productId: string };
  RecipeDetails: { recipeId: string };
  FamilyManagement: undefined;
  Achievements: undefined;
  Notifications: undefined;
  Subscription: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(checkAuthStatus());
      
      if (!user) {
        await dispatch(signInAnonymously());
      }
      
      // SplashScreen.hide(); // Tymczasowo wyłączony
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Dodaj produkt' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Szczegóły produktu' }}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={{ title: 'Szczegóły przepisu' }}
      />
      <Stack.Screen
        name="FamilyManagement"
        component={FamilyManagementScreen}
        options={{ title: 'Zarządzanie rodziną' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Osiągnięcia' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Powiadomienia' }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subskrypcja PRO' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
