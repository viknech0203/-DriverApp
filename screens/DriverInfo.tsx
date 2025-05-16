import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import AppHeader from './AppHeader';
import { RootStackParamList } from './types';

export type Document = {
  name: string;
  nomer: string;
  date_from: string;
  date_to: string;
};

export type Driver = {
  fio: string;
  docs?: Document[];
};

// 👇 Указываем тип маршрута для получения параметра driver
type DriverInfoRouteProp = RouteProp<RootStackParamList, 'DriverInfo'>;

export default function DriverInfo() {
  const route = useRoute<DriverInfoRouteProp>(); // ✅ Типизированный useRoute
 const raw = route.params?.driver;

if (!raw) {
  return (
    <View style={styles.container}>
      <Text style={styles.noData}>Нет данных о водителе</Text>
    </View>
  );
}


  useEffect(() => {
    console.log('=== DriverInfo монтируется ===', raw);
  }, [raw]);

  let driver: Driver;
  try {
    console.log('Сырой параметр driver:', raw);
    driver = JSON.parse(raw); // Парсим строку в объект
  } catch {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Ошибка разбора данных</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
   
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Водитель</Text>
        <InfoItem label="ФИО" value={driver.fio} />

        <Text style={styles.subSectionTitle}>Документы</Text>
        {driver.docs?.map((doc, i) => (
          <View key={i} style={styles.card}>
            <InfoItem label="Тип документа" value={doc.name} />
            <InfoItem label="Номер" value={doc.nomer || '—'} />
            <InfoItem label="Действует с" value={doc.date_from} />
            <InfoItem label="Действует до" value={doc.date_to} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', margin: 20 },
  subSectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 10 },
  card: {
    backgroundColor: '#f9f9f9',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  item: { marginBottom: 8 },
  label: { fontWeight: '600' },
  value: {},
  noData: { textAlign: 'center', color: '#888', marginTop: 50 },
});
