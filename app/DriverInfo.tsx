import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from './AppHeader'; // путь правильный

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

export default function DriverInfo() {
  const params = useLocalSearchParams();
  const raw = params.driver as string | undefined;

  useEffect(() => {
    console.log('=== DriverInfo монтируется ===', raw);
  }, [raw]);

  if (!raw) {
    return (
      <View style={styles.container}>
        <AppHeader screenName="Информация о водителе" status="" driverName="" driver={{ fio: '' }} />
        <Text style={styles.noData}>Данные о водителе недоступны</Text>
      </View>
    );
  }

  let driver: Driver;
  try {
    driver = JSON.parse(raw);
  } catch {
    return (
      <View style={styles.container}>
        <AppHeader screenName="Информация о водителе" status="" driverName="" driver={{ fio: '' }} />
        <Text style={styles.noData}>Ошибка разбора данных</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader screenName="Информация о водителе" status="" driverName={driver.fio} driver={driver} />
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
  container: { flex: 1, backgroundColor: '#fff' }, // flex:1 чтобы занимал весь экран
  content: { paddingBottom: 20 }, // добавили отступы для скролла
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
