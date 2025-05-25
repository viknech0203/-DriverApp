
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from 'src/AuthScreen';
import FlightInfoScreen from './FlightInfoScreen';
import Chat from './Chat';
import FlightStatusScreen from './FlightStatus';
import DriverInfoScreen from './DriverInfo';
import MainTabsScreen from './MainTabsScreen';
import { RootStackParamList } from './types';
import DriverInfo from './DriverInfo';
// import TopTabsNavigator from './TopTabsNavigator';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Экран с боковым меню
function DrawerRoutes() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
    <Drawer.Screen name="Главная" component={MainTabsScreen} />
    </Drawer.Navigator>
  );
}

// Основной навигационный контейнер
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="Main" component={DrawerRoutes} />
        {/* <Stack.Screen name="DriverInfo" component={DriverInfo} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
