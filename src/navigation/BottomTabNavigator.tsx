import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState } from '../store/store';
import HomeScreen from '../screens/HomeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import RecipesScreen from '../screens/RecipesScreen';
import MealPlannerScreen from '../screens/MealPlannerScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type BottomTabParamList = {
  Home: undefined;
  Shopping: undefined;
  Recipes: undefined;
  MealPlanner: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const { isPro } = useSelector((state: RootState) => state.auth);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'fridge' : 'fridge-outline';
              break;
            case 'Shopping':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Recipes':
              iconName = focused ? 'chef-hat' : 'chef-hat';
              break;
            case 'MealPlanner':
              iconName = focused ? 'calendar-month' : 'calendar-month-outline';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Spiżarnia',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListScreen}
        options={{
          title: 'Zakupy',
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          title: 'Przepisy',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style, { position: 'relative' }]}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
      {isPro && (
        <Tab.Screen
          name="MealPlanner"
          component={MealPlannerScreen}
          options={{
            title: 'Planer',
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ustawienia',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
