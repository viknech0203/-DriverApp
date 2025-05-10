// import React from 'react';
// import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
// import AppHeader from './AppHeader';
// import MainTabs from './MainTabs';
// import type { Driver } from './DriverInfo';

// export default function MainScreen() {
//   const params = useLocalSearchParams();
//   const raw = params.driver as string | undefined;

//   if (!raw) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.errorText}>Данные о водителе не переданы</Text>
//       </SafeAreaView>
//     );
//   }

//   let driver: Driver;
//   try {
//     driver = JSON.parse(raw);
//   } catch {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.errorText}>Ошибка при чтении данных о водителе</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <AppHeader
//         screenName="Рейс"
//         status="Подтвержден"
//         driverName={driver.fio}
//         driver={driver}
//       />
//       <View style={styles.tabsContainer}>
//         <MainTabs />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   tabsContainer: {
//     flex: 1,
//   },
//   errorText: {
//     marginTop: 50,
//     textAlign: 'center',
//     color: '#888',
//     fontSize: 16,
//   },
// });
