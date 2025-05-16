import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { fetchFlightInfo } from './api'; 
import { useNavigation } from '@react-navigation/native'; 
import { FlightData } from "./types";
import { RootStackParamList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withHeader } from './withHeader';  // импорт HOC

function FlightInfoScreen() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);

  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverInfo'>;
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFlightInfo();
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

  if (!flightData || !flightData.driver || !flightData.route) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Данные рейса повреждены или не найдены</Text>
      </View>
    );
  }

  const { driver, route } = flightData;

  const navigateToDriverInfo = () => {
    navigation.navigate('DriverInfo', { driver: JSON.stringify(driver) });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <TouchableOpacity style={styles.button} onPress={navigateToDriverInfo}>
        <Text style={styles.buttonText}>Информация о водителе</Text>
      </TouchableOpacity>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#333' },
  routeSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  trackSection: { marginLeft: 10, marginTop: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#ccc' },
  item: { marginBottom: 10 },
  label: { fontWeight: '600', fontSize: 16, color: '#444' },
  value: { fontSize: 16, marginTop: 2, color: '#555' },
  button: { backgroundColor: '#779DD6', padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});

export default FlightInfoScreen
