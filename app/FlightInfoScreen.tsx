// FlightInfoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from './AppHeader';
import DriverInfo, { Driver } from './DriverInfo';

type FlightData = {
  driver: Driver;
  route: any[];
};

export default function FlightInfoScreen() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const baseUrl = await AsyncStorage.getItem('base_url');
        const token = await AsyncStorage.getItem('access_token');
        if (!baseUrl || !token) {
          Alert.alert('Ошибка', 'Нет данных для подключения');
          return;
        }
        const resp = await fetch(`${baseUrl}/get_info`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await resp.json();
        setFlightData(data);
      } catch (e: any) {
        Alert.alert('Ошибка', e.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#779DD6" />;
  }

  if (!flightData) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Информация не найдена</Text>
      </View>
    );
  }

  const { driver, route } = flightData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Передаём driver целиком */}
      <AppHeader screenName="Информация о рейсе" status="Активен" driverName={driver.fio} driver={driver} />

      <Text style={styles.sectionTitle}>Маршруты</Text>
      {route.map((r, i) => (
        <View key={i} style={styles.routeSection}>
          <InfoItem label="Автомобиль" value={r.mam} />
          <InfoItem label="Гос. номер" value={r.nomer} />
          <InfoItem label="Дата выезда" value={r.date_begin} />
          <InfoItem label="Дата возвращения" value={r.date_end} />
          <InfoItem label="Время выезда" value={r.departure.slice(0, 5)} />
          <InfoItem label="Время прибытия" value={r.arrival.slice(0, 5)} />
          {r.track.map((t: any, j: number) => (
            <View key={j} style={styles.trackSection}>
              <InfoItem label="Клиент" value={t.client} />
              <InfoItem label="Примечание" value={t.note} />
              <InfoItem label="Подразделение" value={t.division} />
            </View>
          ))}
        </View>
      ))}
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
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#333' },
  routeSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  trackSection: { marginLeft: 10, marginTop: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#ccc' },
  item: { marginBottom: 10 },
  label: { fontWeight: '600', fontSize: 16, color: '#444' },
  value: { fontSize: 16, marginTop: 2, color: '#555' },
});
