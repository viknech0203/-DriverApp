// api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlightData } from './types';

export async function fetchFlightInfo(): Promise<FlightData> {
  const baseUrl = await AsyncStorage.getItem('base_url');
  const token = await AsyncStorage.getItem('access_token');

  if (!baseUrl || !token) {
    throw new Error('Нет данных для подключения');
  }

  const resp = await fetch(`${baseUrl}/get_info`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    throw new Error(`Ошибка запроса: ${resp.status}`);
  }

  return await resp.json();
}
