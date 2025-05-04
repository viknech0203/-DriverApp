// MainTabs.tsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FlightInfoScreen from './FlightInfoScreen';
import Chat from './Chat';
import FlightStatus from './FlightStatus';
import DriverInfo from './DriverInfo';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: '#B7C8E1' },
      }}
    >
      <Tab.Screen name="Рейс" component={FlightInfoScreen} />
      <Tab.Screen name="Чат" component={Chat} />
      <Tab.Screen name="Статус" component={FlightStatus} />
      <Tab.Screen name="Водитель" component={DriverInfo} />
    </Tab.Navigator>
  );
}
