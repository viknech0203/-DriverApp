import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from './AppHeader'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


const customers = ['ООО Рога и Копыта', 'ИП Иванов', 'АО ПассажирТранс'];
const statuses = [
  { id: '1', date: '2024-04-11 10:00', customer: 'АО ПассажирТранс', status: 'Принят' },
  { id: '2', date: '2024-04-11 14:30', customer: 'ИП Иванов', status: 'В пути' },
];

const FlightStatus: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [info, setInfo] = useState('');

  const handleNow = () => {
    setDate(new Date());
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('base_url');
      const token = await AsyncStorage.getItem('access_token');
  
      if (!baseUrl || !token) {
        console.log('base_url или токен не найдены');
        return;
      }
  
      const response = await fetch(`${baseUrl}/set_status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          customer: selectedCustomer,
          info,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка отправки статуса: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log('Ответ сервера:', responseData);
      // Здесь можно отобразить его на экране или обновить FlatList
  
    } catch (error: any) {
      console.error('Ошибка при отправке статуса:', error.message);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
    <AppHeader screenName="Статус рейса" status="Активен" driverName="Иванов И.И." />
      <Text style={styles.header}>Статус рейса</Text>

      {/* Выбор даты */}
      <Text style={styles.label}>Дата и время</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
          <Text>{date.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nowButton} onPress={handleNow}>
          <Text style={styles.nowText}>Сейчас</Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Заказчик */}
      <Text style={styles.label}>Выбор заказчика</Text>
      {customers.map((customer) => (
        <TouchableOpacity
          key={customer}
          style={[
            styles.customerButton,
            selectedCustomer === customer && styles.customerButtonSelected,
          ]}
          onPress={() => setSelectedCustomer(customer)}
        >
          <Text>{customer}</Text>
        </TouchableOpacity>
      ))}

      {/* Дополнительная информация */}
      <Text style={styles.label}>Дополнительная информация</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите текст"
        value={info}
        onChangeText={setInfo}
        multiline
      />

      {/* Отправить */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Отправить</Text>
      </TouchableOpacity>

      {/* История изменений */}
      <Text style={styles.historyTitle}>Список изменений статусов</Text>
      <FlatList
        data={statuses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.statusItem}>
            <Text>{item.date}</Text>
            <Text>{item.customer}</Text>
            <Text>{item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default FlightStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  nowButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 5,
  },
  customerButtonSelected: {
    backgroundColor: '#d0f0c0',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  historyTitle: {
    fontSize: 18,
    marginVertical: 20,
    fontWeight: '600',
  },
  statusItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
});
