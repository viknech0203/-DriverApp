import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DriverInfo({ driver }: { driver: any }) {
  console.log('Параметр driver в DriverInfo:', driver);

  if (!driver) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Нет данных о водителе</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Водитель</Text>
      <InfoItem label="ФИО" value={driver.fio || '—'} />

      <Text style={styles.subSectionTitle}>Документы</Text>
      {Array.isArray(driver.docs) && driver.docs.length > 0 ? (
        driver.docs.map((doc: any, i: number) => (
          <View key={i} style={styles.card}>
            <InfoItem label="Тип документа" value={doc.name || '—'} />
            <InfoItem label="Номер" value={doc.nomer || '—'} />
            <InfoItem label="Действует с" value={doc.date_from || '—'} />
            <InfoItem label="Действует до" value={doc.date_to || '—'} />
          </View>
        ))
      ) : (
        <Text style={styles.noData}>Документы отсутствуют</Text>
      )}

      {Array.isArray(driver.trips) && driver.trips.length > 0 ? (
        <>
          <Text style={styles.subSectionTitle}>Поездки</Text>
          {driver.trips.map((trip: any, index: number) => (
            <Text key={trip.id || index} style={styles.tripItem}>
              {trip.name || 'Без названия'}
            </Text>
          ))}
        </>
      ) : (
        <Text style={styles.noData}>Поездки отсутствуют</Text>
      )}
    </View>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#f9f9f9',
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  item: { marginBottom: 8 },
  label: { fontWeight: '600' },
  value: {},
  noData: { textAlign: 'center', color: '#888', marginTop: 10 },
  tripItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#eef5ff',
    marginVertical: 4,
    borderRadius: 6,
  },
});
