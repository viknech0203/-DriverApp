import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  screenName: string;
  status: string;
  driverName: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ screenName, status, driverName }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const ROUTES = {
    flightInfo: '/FlightInfoScreen',
    chat: '/Chat',
    status: '/FlightStatus',
    driverInfo: '/DriverInfo', // 👈 добавь этот файл в app/, если его ещё нет
  } as const;

  type RouteType = (typeof ROUTES)[keyof typeof ROUTES];

  const handleNavigate = (route: RouteType) => {
    setMenuOpen(false);
    router.push(route as any);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(prev => !prev)}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.screenName}>{screenName}</Text>

        <Text style={styles.dateTime}>{getCurrentDateTime()}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.driver}>Водитель: {driverName}</Text>
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => handleNavigate(ROUTES.flightInfo)}>
            <Text style={styles.menuItem}>Информация о рейсе</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate(ROUTES.chat)}>
            <Text style={styles.menuItem}>Чат</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate(ROUTES.status)}>
            <Text style={styles.menuItem}>Статус рейса</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate(ROUTES.driverInfo)}>
            <Text style={styles.menuItem}>Информация о водителе</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#B7C8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  status: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  driver: {
    color: '#333',
  },
  menu: {
    backgroundColor: '#E3ECF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default AppHeader;
