
import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setLogin, setPassword } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../screens/types';
import type { AppDispatch, RootState } from '../store/store';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [user, setUser] = useState('');
  const [password, setPasswordValue] = useState('');

  const baseUrl = useSelector((state: RootState) => state.auth.baseUrl);

const handleLogin = async () => {
  try {
    const result = await dispatch(
      loginUser({ login: user, password, baseUrl })
    ).unwrap();

    console.log('Успешный вход, результат:', result);

    if (!result.accessToken) {
      Alert.alert('Ошибка', 'Токен не получен с сервера');
      return;
    }

    // Проверим токен, например, запросом к /me или /profile
    const tokenValid = await validateToken(result.accessToken, baseUrl);
    if (!tokenValid) {
      Alert.alert('Ошибка', 'Сервер отклонил токен — возможно, неправильный логин/пароль');
      return;
    }

    // Всё хорошо — переходим на главный экран
    navigation.navigate('Main');
  } catch (error: any) {
    const message = typeof error === 'string' ? error : error?.message || 'Ошибка авторизации';
    console.error('Ошибка авторизации:', error);
    Alert.alert('Ошибка входа', message);
  }
};

// функция быстрой проверки токена
async function validateToken(token: string, baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/get_chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ last_id: null }),
    });

    if (!res.ok) return false;
    const json = await res.json();
    return !json?.status?.text?.includes('истекший');
  } catch {
    return false;
  }
}



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Авторизация</Text>
        <TextInput
          style={styles.input}
          placeholder="Логин"
          value={user}
          onChangeText={(text) => {
            setUser(text);
            dispatch(setLogin(text));
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPasswordValue(text);
            dispatch(setPassword(text));
          }}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f4f4f4',
  },
  formContainer: {
    width: '100%', maxWidth: 400, padding: 20, backgroundColor: '#fff',
    borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 6,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20,
  },
  input: {
    height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    marginBottom: 15, paddingLeft: 10, fontSize: 16,
  },
  button: {
    backgroundColor: '#498DCA', padding: 10, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  },
});
