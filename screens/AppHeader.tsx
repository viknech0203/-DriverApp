
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Driver } from './DriverInfo';
import { useTabs } from './TabsContext';

interface AppHeaderProps {
  screenName: string;
  status: string;
  driverName?: string;
  driver?: Driver;
}

export default function AppHeader({ screenName, status, driverName = 'Неизвестный водитель', driver }: AppHeaderProps) {
   const { setIndex } = useTabs(); // получаем setIndex
  const navigation = useNavigation<any>();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.screenName}>{screenName}</Text>
        <Text style={styles.dateTime}>{new Date().toLocaleString()}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.driver}>{driverName}</Text>
      </View>

      {menuOpen && (
    <View style={styles.menu}>
      <TouchableOpacity onPress={() => { setMenuOpen(false); setIndex(0); }}>
        <Text style={styles.menuItem}>Информация о рейсе</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { setMenuOpen(false); setIndex(1); }}>
        <Text style={styles.menuItem}>Чат</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { setMenuOpen(false); setIndex(2); }}>
        <Text style={styles.menuItem}>Статус рейса</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {
        setMenuOpen(false);
        if (driver) setIndex(3);
        else alert('Информация о водителе недоступна');
      }}>
        <Text style={styles.menuItem}>Информация о водителе</Text>
      </TouchableOpacity>
    </View>
  )}
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#B7C8E1', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 10 },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenName: { fontSize: 18, fontWeight: 'bold' },
  dateTime: { fontSize: 14, color: '#666' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  status: { color: '#4CAF50', fontWeight: '600' },
  driver: { color: '#333' },
  menu: { backgroundColor: '#E3ECF6', padding: 12 },
  menuItem: { paddingVertical: 8, fontSize: 16, color: '#333' },
});
