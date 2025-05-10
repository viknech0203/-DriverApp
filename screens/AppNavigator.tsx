
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from 'src/AuthScreen';
import FlightInfoScreen from './FlightInfoScreen';
import Chat from './Chat';
import FlightStatusScreen from './FlightStatus';
import DriverInfoScreen from './DriverInfo';
// import TopTabsNavigator from './TopTabsNavigator';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Экран с боковым меню
function DrawerRoutes() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Главная" component={FlightInfoScreen} />
      <Drawer.Screen name="Информация о рейсе" component={FlightInfoScreen} />
      <Drawer.Screen name="Статус рейса" component={FlightStatusScreen} />
      <Drawer.Screen name="Информация о водителе" component={DriverInfoScreen} />
      <Drawer.Screen name="Чат" component={Chat} />
    </Drawer.Navigator>
  );
}

// Основной навигационный контейнер
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={DrawerRoutes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
