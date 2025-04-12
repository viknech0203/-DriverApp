
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from './AppHeader'; 

const flightData = {
  car: 'Toyota Camry',
  licensePlate: 'А123ВС 77',
  driver: 'Иванов И.И.',
  departureDate: '2025-04-12',
  departureTime: '08:00',
  returnTime: '18:00',
  customer: 'ООО Рога и Копыта',
  customerNotes: 'Просьба быть вовремя, строго по пропускам.',
  department: 'Отдел логистики',
  arrivalTime: '08:30',
  leavingTime: '09:00',
  contacts: '+7 (999) 123-45-67',
  warnings: 'Проверить давление в шинах перед выездом.',
};

const FlightInfoScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
       <AppHeader screenName="Статус рейса" status="Активен" driverName="Иванов И.И." />
      <Text style={styles.header}>Информация о рейсе</Text>

      <InfoItem label="Автомобиль" value={flightData.car} />
      <InfoItem label="Гос. номер" value={flightData.licensePlate} />
      <InfoItem label="Водитель" value={flightData.driver} />
      <InfoItem label="Дата выезда" value={flightData.departureDate} />
      <InfoItem label="Время выезда" value={flightData.departureTime} />
      <InfoItem label="Время возвращения" value={flightData.returnTime} />
      <InfoItem label="Заказчик" value={flightData.customer} />
      <InfoItem label="Примечания по заказчику" value={flightData.customerNotes} />
      <InfoItem label="Подразделение" value={flightData.department} />
      <InfoItem label="Время прибытия к заказчику" value={flightData.arrivalTime} />
      <InfoItem label="Время убытия от заказчика" value={flightData.leavingTime} />
      <InfoItem label="Контакты" value={flightData.contacts} />
      <InfoItem label="Предупреждения по машине" value={flightData.warnings} />
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
  item: {
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: '#555',
  },
});

export default FlightInfoScreen;
