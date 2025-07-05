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
import { Route, FlightData } from './types';

export default function FlightInfoScreen() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const fetchFlightInfo = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const storedHost = await AsyncStorage.getItem("server_host");

    if (!token || !storedHost) {
      throw new Error("Нет токена или хоста");
    }

    const hostJson = JSON.parse(storedHost);

    const response = await fetch("https://app.atp-online.ru/driver_app/get_data.php", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: {
          ip: hostJson.ip,
          port: hostJson.port,
          is_ssl_port: hostJson.is_ssl_port,
          endpoint: "api/v1/driver_mode/get_info", // аналогично FlightStatus
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка запроса: ${text}`);
    }

    const data: FlightData = await response.json();
    setFlightData(data);
  } catch (e: any) {
    console.error("[FlightInfo] Ошибка:", e);
    Alert.alert("Ошибка", e.message || "Не удалось получить данные");
  } finally {
    setLoading(false);
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

  const { driver, route } = flightData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
