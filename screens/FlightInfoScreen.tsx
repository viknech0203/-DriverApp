import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from './AppHeader';
import DriverInfo from './DriverInfo';
import { Route, FlightData } from './types';

export default function FlightInfoScreen() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let requestCount = 0;

  const fetchFlightInfo = async () => {
    requestCount++;
    const timestamp = new Date().toISOString();
    console.log(` [${timestamp}] Запрос #${requestCount} — Начало`);

    try {
      const baseUrl = await AsyncStorage.getItem('base_url');
      const token = await AsyncStorage.getItem('access_token');

      console.log(' baseUrl:', baseUrl);
      console.log(' token:', token?.slice(0, 10) + '...');

      if (!baseUrl || !token) {
        console.warn(' Отсутствуют настройки подключения: baseUrl или token');
        Alert.alert('Ошибка', 'Не указаны настройки подключения');
        return;
      }

      const response = await fetch(`${baseUrl}/get_info`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      console.log(` HTTP статус: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(` Ошибка HTTP: ${response.status} — ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: FlightData = await response.json();
      console.log(' Полученные данные от сервера:', JSON.stringify(data, null, 2));

      setFlightData(data);
    } catch (e: any) {
      console.error(' Ошибка при получении данных:', e.message);
      Alert.alert('Ошибка', e.message || 'Не удалось получить данные');
    } finally {
      setLoading(false);
      console.log(` [${timestamp}] Запрос #${requestCount} — Завершён\n`);
    }
  };

  fetchFlightInfo();
}, []);


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#779DD6" />
      </View>
    );
  }

  if (!flightData) {
    return (
      <View style={styles.centered}>
        <Text>Данные не найдены</Text>
      </View>
    );
  }
  console.log('Состояние flightData:', flightData);
  const { driver, route } = flightData;
  console.log('driver, полученный из flightData:', driver);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <AppHeader screenName="Информация о рейсе" driverName={driver?.fio} driver={driver} /> */}

      <Text style={styles.sectionTitle}>Маршруты</Text>

      {Array.isArray(route) && route.length > 0 ? (
        route.map((r, i) => (
          <View key={i} style={styles.routeCard}>
            <InfoItem label="Автомобиль" value={r.mam || '—'} />
            <InfoItem label="Гос. номер" value={r.nomer || '—'} />
            <InfoItem label="Дата выезда" value={r.date_begin || '—'} />
            {r.date_begin !== r.date_end && (
              <InfoItem label="Дата возвращения" value={r.date_end || '—'} />
            )}
            <InfoItem label="Время выезда" value={r.departure?.slice(0, 5) || '—'} />
            <InfoItem label="Время прибытия" value={r.arrival?.slice(0, 5) || '—'} />

            {Array.isArray(r.track) &&
              r.track.map((t, j) => (
                <View key={j} style={styles.trackSection}>
                  <InfoItem label="Клиент" value={t.client || '—'} />
                  <InfoItem label="Примечание" value={t.note || '—'} />
                  <InfoItem label="Подразделение" value={t.division || '—'} />
                </View>
              ))}
          </View>
        ))
      ) : (
        <Text style={{ marginLeft: 16 }}>Нет маршрутов</Text>
      )}

      {/* <DriverInfo driver={driver} /> */}
    </ScrollView>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', margin: 16 },
  routeCard: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  item: { marginBottom: 6 },
  label: { fontWeight: '600' },
  value: {},
  trackSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
  },
});
