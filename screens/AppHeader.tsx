

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from './types';
import { useTabs } from './TabsContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AppHeaderProps {
  screenName: string;
  driverName?: string;
  driver?: Driver;
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export default function AppHeader({
  screenName,
  driverName = 'Неизвестный водитель',
  driver,
  onMenuToggle,
  menuOpen,
}: AppHeaderProps) {
  const {  index,setIndex } = useTabs();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            onMenuToggle();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.screenName}>{screenName}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.driver}>{driverName}</Text>
      </View>

      {menuOpen && (
        <>
          {/* Затемнение правой части экрана */}
          <Pressable style={styles.overlay} onPress={onMenuToggle} />

          {/* Меню слева */}
          <View style={styles.menu}>
            <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(0); }}>
              <Text style={[styles.menuItem, index === 0 && styles.activeItem]}>Информация о рейсе</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(1); }}>
              <Text style={[styles.menuItem, index === 1 && styles.activeItem]}>Чат</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(2); }}>
              <Text style={[styles.menuItem, index === 2 && styles.activeItem]}>Статус рейса</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onMenuToggle();
              driver ? setIndex(3) : alert('Информация о водителе недоступна');
            }}>
              <Text style={[styles.menuItem, index === 3 && styles.activeItem]}>Информация о водителе</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#B7C8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 30,
    paddingBottom: 10,
    position: 'relative',
    overflow: 'visible',
    minHeight: 100,
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  driver: {
    color: '#333',
  },
  menu: {
    position: 'absolute',
    top: 33,
    left: 0,
    height: screenHeight,
    width: screenWidth * 0.7,
    backgroundColor: '#E3ECF6',
    padding: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  overlay: {
    position: 'absolute',
    top: 34,
    left: screenWidth * 0.7,
    width: screenWidth * 0.3,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 55,
  },
  menuItem: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  activeItem: {
  backgroundColor: '#cddff1',
  borderRadius: 8,
  fontWeight: 'bold',
  paddingHorizontal: 8,
},
});
