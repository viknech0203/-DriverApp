import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const MainScreen: React.FC = () => {
    const router = useRouter();
  const handleNavigate = (screenName: string) => {
    if (screenName === 'Чат') {
        router.push('/Chat');
      }  else if (screenName === 'Информация о рейсе') {
        router.push('/FlightInfo');
      }  else if (screenName === 'Статус рейса') {
        router.push('/FlightStatus');
      }
    
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Главное меню</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Информация о рейсе')}>
          <Text style={styles.menuText}>Информация о рейсе</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Чат')}>
          <Text style={styles.menuText}>Чат</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Статус рейса')}>
          <Text style={styles.menuText}>Статус рейса</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuItem: {
    backgroundColor: '#779DD6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MainScreen;
