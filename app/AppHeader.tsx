import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppHeaderProps {
  screenName: string;  // Пропс для имени экрана
  status: string;      // Пропс для статуса рейса
  driverName: string;  // Пропс для имени водителя
}

const AppHeader: React.FC<AppHeaderProps> = ({ screenName, status, driverName }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.screenName}>{screenName}</Text>
        <Text style={styles.dateTime}>{getCurrentDateTime()}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.driver}>Водитель: {driverName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#B7C8E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screenName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  driver: {
    color: '#333',
  },
});

export default AppHeader;
