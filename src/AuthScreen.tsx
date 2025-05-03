import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setTokens } from '../store/authSlice'; 
import type { AppDispatch } from '../store/store'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';



interface Props {}


const AuthScreen: React.FC<Props> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [inn, setInn] = useState('');



  const handleLogin = async () => {
    try {
      //  хост и порт по ИНН
      const innResponse = await fetch('https://app.atp-online.ru/driver_app/get_host.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inn }),
      });

      const innData = await innResponse.json();
      const baseUrl = `http://${innData.host}:${innData.port}/api/v1/driver_mode`;
      const authUrl = `${baseUrl}/auth`;

      // Авторизация
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      });

      if (!authResponse.ok) throw new Error('Ошибка авторизации');

      const authData = await authResponse.json();


if (authData.token) {
  await AsyncStorage.setItem('access_token', authData.token);

  if (authData.refresh_token) {
    await AsyncStorage.setItem('refresh_token', authData.refresh_token);
  }
  await AsyncStorage.setItem('base_url', baseUrl);

  console.log('Access Token:', authData.token);
  console.log('Refresh Token:', authData.refresh_token);


  dispatch(
    setTokens({
      accessToken: authData.token,
      refreshToken: authData.refresh_token ?? null, 
    })
  );

        console.log('Успешный вход');
        router.push('/FlightInfoScreen');
      } else {
        throw new Error('Не получен токен');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Что-то пошло не так');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Авторизация</Text>

        <TextInput
          style={styles.input}
          placeholder="Логин"
          value={user}
          onChangeText={setUser}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="ИНН"
          value={inn}
          onChangeText={setInn}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f4f4f4' },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default AuthScreen;
