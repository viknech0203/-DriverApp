// MainTabsScreen.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import FlightInfoScreen from './FlightInfoScreen';
import Chat from './Chat';
import FlightStatusScreen from './FlightStatus';
import DriverInfoScreen from './DriverInfo';
import { TabsProvider, useTabs } from './TabsContext';

const initialLayout = { width: Dimensions.get('window').width };

const renderScene = SceneMap({
  flight: FlightInfoScreen,
  chat: Chat,
  status: FlightStatusScreen,
  driver: DriverInfoScreen,
});

function TabWrapper() {
  const { index, setIndex } = useTabs();
  const routes = [
    { key: 'flight', title: 'Рейс' },
    { key: 'chat', title: 'Чат' },
    { key: 'status', title: 'Статус' },
    { key: 'driver', title: 'Водитель' },
  ];

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={() => null}
    />
  );
}

export default function MainTabsScreen() {
  return (
    <TabsProvider>
      <TabWrapper />
    </TabsProvider>
  );
}
