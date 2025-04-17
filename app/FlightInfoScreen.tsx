import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from './AppHeader';

const FlightInfoScreen: React.FC = () => {
  const [flightData, setFlightData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlightInfo = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem('base_url');
        const token = await AsyncStorage.getItem('access_token');
  
        console.log('→ Запрашиваю данные...');
        console.log('baseUrl', baseUrl);
        console.log('token', token);
  
        if (!baseUrl || !token) {
          Alert.alert('Ошибка', 'Нет данных для подключения');
          return;
        }
  
        const response = await fetch(`${baseUrl}/get_info`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
  
        console.log('← Статус:', response.status);
        const data = await response.json();
        console.log('Ответ:', JSON.stringify(data, null, 2));
  
     
      
        setFlightData(data);
  
      } catch (error: any) {
        Alert.alert('Ошибка', error.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
  
    fetchFlightInfo();
  }, []);
  

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.');
    return `${day}.${month}.${year}`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || '';
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#779DD6" />;
  }

  if (!flightData) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Информация не найдена</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader screenName="Информация о рейсе" status="Активен" driverName={flightData.driver?.fio || ''} />

      <Text style={styles.sectionTitle}>Водитель</Text>
      <InfoItem label="ФИО" value={flightData.driver?.fio || '—'} />

      {flightData.driver?.docs?.map((doc: any, index: number) => (
        <View key={index} style={styles.subSection}>
          <InfoItem label="Документ" value={doc.name} />
          <InfoItem label="Номер" value={doc.nomer} />
          <InfoItem label="Срок действия" value={`${doc.date_from} – ${doc.date_to}`} />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Маршруты</Text>
      {flightData.route?.map((route: any, index: number) => (
        <View key={index} style={styles.routeSection}>
          <InfoItem label="Автомобиль" value={route.mam} />
          <InfoItem label="Гос. номер" value={route.nomer} />
          <InfoItem label="Дата выезда" value={route.date_begin} />
          <InfoItem label="Дата возвращения" value={route.date_end} />
          <InfoItem label="Время выезда" value={formatTime(route.departure)} />
          <InfoItem label="Время прибытия" value={formatTime(route.arrival)} />

          {route.track?.map((track: any, tIndex: number) => (
            <View key={tIndex} style={styles.trackSection}>
              <InfoItem label="Клиент" value={track.client} />
              <InfoItem label="Примечание" value={track.note} />
              <InfoItem label="Подразделение" value={track.division} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subSection: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  routeSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  trackSection: {
    marginLeft: 10,
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
  },
  item: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
  },
  value: {
    fontSize: 16,
    marginTop: 2,
    color: '#555',
  },
});

export default FlightInfoScreen;
