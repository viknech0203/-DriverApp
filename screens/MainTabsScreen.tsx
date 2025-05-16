// MainTabsScreen.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import FlightInfoScreen from './FlightInfoScreen';
import Chat from './Chat';
import FlightStatusScreen from './FlightStatus';
import DriverInfoScreen from './DriverInfo';
import { TabsProvider, useTabs } from './TabsContext';
import { withHeader } from './withHeader';

const initialLayout = { width: Dimensions.get('window').width };

const renderScene = SceneMap({
  flight: withHeader(FlightInfoScreen, 'Информация о рейсе'),
  chat: withHeader(Chat, 'Чат'),
  status: withHeader(FlightStatusScreen, 'Статус рейса'),
  driver: withHeader(DriverInfoScreen, 'Инфо о водителе'),
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
