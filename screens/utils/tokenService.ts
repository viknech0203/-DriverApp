
import AsyncStorage from '@react-native-async-storage/async-storage';

export const refreshToken = async (baseUrl: string) => {
  const token = await AsyncStorage.getItem('refresh_token');
  if (!token) throw new Error('Нет refresh токена');

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: token }),
  });

  const data = await response.json();
  if (data.token) {
    await AsyncStorage.setItem('access_token', data.token);
    return data.token;
  }

  throw new Error('Не удалось обновить токен');
};
