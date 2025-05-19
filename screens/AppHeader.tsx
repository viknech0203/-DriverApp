// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Driver } from './DriverInfo';
// import { useTabs } from './TabsContext';

// interface AppHeaderProps {
//   screenName: string;

//   driverName?: string;
//   driver?: Driver;
//   onMenuToggle: () => void;
//   menuOpen: boolean;
// }

// export default function AppHeader({
//   screenName,

//   driverName = 'Неизвестный водитель',
//   driver,
//   onMenuToggle,
//   menuOpen,
// }: AppHeaderProps) {
//   const { setIndex } = useTabs();

//   return (
//   <View style={styles.wrapper}>
//   <View style={styles.header}>
//     <TouchableOpacity
//       onPress={() => {
//         console.log('Menu button pressed');
//         onMenuToggle();
//       }}
//       hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//     >
//       <Ionicons name="menu" size={28} color="black" />
//     </TouchableOpacity>

//     <Text style={styles.screenName}>{screenName}</Text>
//   </View>

//   <View style={styles.bottomRow}>
//     <Text style={styles.driver}>{driverName}</Text>
//   </View>

//   {menuOpen && (
//     <View style={styles.menu}>
//       <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(0); }}>
//         <Text style={styles.menuItem}>Информация о рейсе</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(1); }}>
//         <Text style={styles.menuItem}>Чат</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(2); }}>
//         <Text style={styles.menuItem}>Статус рейса</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => {
//         onMenuToggle();
//         driver ? setIndex(3) : alert('Информация о водителе недоступна');
//       }}>
//         <Text style={styles.menuItem}>Информация о водителе</Text>
//       </TouchableOpacity>
//     </View>
//   )}
// </View>

//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//   backgroundColor: '#B7C8E1',
//   borderBottomWidth: 1,
//   borderBottomColor: '#ddd',
//   paddingTop: 30, 
//   paddingBottom: 10,
//   position: 'relative',
//   overflow: 'visible',
//   minHeight: 100,  // высота шапки
// },
//   header: {
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     //  height: 110, 
//   },
//   screenName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//   },

//   bottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//   },
 
//   driver: {
//     color: '#333',
//   },
//   menu: {
//     backgroundColor: '#E3ECF6',
//     padding: 12,
//     position: 'absolute',
//     top: 70, // немного ниже шапки (header + bottomRow)
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 5, // для андроида
//   },
//   menuItem: {
//     paddingVertical: 8,
//     fontSize: 16,
//     color: '#333',
//   },
// });

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from './DriverInfo';
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
  const { setIndex } = useTabs();

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
              <Text style={styles.menuItem}>Информация о рейсе</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(1); }}>
              <Text style={styles.menuItem}>Чат</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onMenuToggle(); setIndex(2); }}>
              <Text style={styles.menuItem}>Статус рейса</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onMenuToggle();
              driver ? setIndex(3) : alert('Информация о водителе недоступна');
            }}>
              <Text style={styles.menuItem}>Информация о водителе</Text>
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
    zIndex: 15,
  },
  menuItem: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
});
