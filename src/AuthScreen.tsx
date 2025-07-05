import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setLogin, setPassword } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../screens/types';
import type { AppDispatch, RootState } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [user, setUser] = useState('');
  const [password, setPasswordValue] = useState('');
  const [loading, setLoading] = useState(false);

  const inn = useSelector((state: RootState) => state.auth.inn);

  const handleLogin = async () => {
    if (loading) return;

    if (!user || !password || !inn) {
      Alert.alert('Ошибка', 'Введите логин, пароль и ИНН');
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        loginUser({ login: user, password, inn })
      ).unwrap();

      const tokenValid = await validateToken(result.accessToken);
      if (!tokenValid) {
        Alert.alert('Ошибка', 'Неверный токен');
        setLoading(false);
        return;
      }

      navigation.navigate('Main');
    } catch (error: any) {
      const message =
        typeof error === 'string'
          ? error
          : error?.message || 'Ошибка авторизации';
      console.error('Ошибка авторизации:', error);
      Alert.alert('Ошибка входа', message);
    } finally {
      setLoading(false);
    }
  };

  // Новый способ проверки токена через get_data.php с безопасным парсингом и проверкой Content-Type
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const hostStr = await AsyncStorage.getItem('server_host');
      if (!hostStr) return false;

      let hostJson;
      try {
        hostJson = JSON.parse(hostStr);
      } catch (e) {
        console.error('Ошибка парсинга server_host:', e);
        return false;
      }

      const response = await fetch(
        'https://app.atp-online.ru/driver_app/get_data.php',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: {
              ip: hostJson.ip,
              port: hostJson.port,
              is_ssl_port: hostJson.is_ssl_port,
              endpoint: 'api/v1/driver_mode/get_chat',
            },
            last_id: null,
          }),
        }
      );

      if (!response.ok) return false;

      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        console.error('Ответ сервера не в формате JSON');
        return false;
      }

      const json = await response.json();
      return !json?.status?.text?.includes('истекший');
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Авторизация</Text>

        <TextInput
          style={styles.input}
          placeholder="Логин"
          autoCapitalize="none"
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
          autoCapitalize="none"
          value={password}
          onChangeText={(text) => {
            setPasswordValue(text);
            dispatch(setPassword(text));
          }}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Войти</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
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
    backgroundColor: '#498DCA',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
