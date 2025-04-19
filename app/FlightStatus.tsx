import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from './AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';


type TrackClient = { client_id: string; client: string };


const FlightStatus: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusDir, setStatusDir] = useState<{status_id: string; name: string;}[]>([]);
  const [clients, setClients] = useState<TrackClient[]>([]);
  const [raznId, setRaznId] = useState<string>('');
  const [dataId, setDataId] = useState<string>('');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [vol, setVol] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem('base_url');
        const token = await AsyncStorage.getItem('access_token');
        if (!baseUrl || !token) throw new Error('Нет baseUrl или token');

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // 1) Получаем справочник статусов и клиентов
        const infoResp = await fetch(`${baseUrl}/get_info`, { method: 'POST', headers, body: '{}' });
        const infoJson = await infoResp.json();

        

        setClients(
          (infoJson.clients || []).map((c: any) => ({
            client_id: String(c.client_id),
            client: c.client,
          }))
        );
        setRaznId(String(infoJson.razn_id));
        setDataId(String(infoJson.data_id));

        const dirResp = await fetch(`${baseUrl}/get_status_dir`, { method: 'POST', headers, body: '{}' });
        const dirJson = await dirResp.json();


        const trackClients: TrackClient[] = (infoJson.route || [])
        .flatMap((route: any) => route.track || [])
        .filter((t: any) => t.client_id && t.client)
        .map((t: any) => ({
          client_id: String(t.client_id),
          client: t.client,
        }));
      
        const uniqueClients: TrackClient[] = Array.from(
          new Map(trackClients.map((c) => [c.client_id, c])).values()
        );
      
      setClients(uniqueClients);
      
      if (uniqueClients.length > 0) {
        setSelectedClientId(uniqueClients[0].client_id);
      }


        setStatusDir(
          (dirJson.status_dir || []).map((s: any) => ({
            status_id: String(s.status_id),
            name: s.name,
          }))
        );

        // 2) Получаем историю статусов
        if (infoJson.razn_id) {
          const historyResp = await fetch(
            `${baseUrl}/get_status/${infoJson.razn_id}`,
            { method: 'POST', headers, body: '{}' }
          );
          const historyJson = await historyResp.json();
          setStatuses(historyJson.status_list || []);
        }
      } catch (e) {
        console.error('Ошибка загрузки initial data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('base_url');
      const token = await AsyncStorage.getItem('access_token');
      if (!baseUrl || !token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const body = {
        apply_stamp_status: date.toISOString().slice(0, 19).replace('T', ' '),
        status_id: selectedStatusId,
        client_id: selectedClientId,  // Передаем выбранный client_id
        razn_id: raznId,
        vol,
        data_id: dataId,
        info,
      };

      const resp = await fetch(`${baseUrl}/set_status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const result = await resp.json();
      if (result.status?.code === 0) {
        // Обновляем историю
        const historyResp = await fetch(`${baseUrl}/get_status/${raznId}`, {
          method: 'POST',
          headers,
          body: '{}',
        });
        const historyJson = await historyResp.json();
        setStatuses(historyJson.status_list || []);
      } else {
        console.error('Ошибка при отправке:', result.status.text);
      }
    } catch (e) {
      console.error('Ошибка handleSubmit:', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader screenName="Статус рейса" status="Активен" driverName="Иванов И.И." />
      <ScrollView>
        {/* Дата и время */}
        <Text style={styles.label}>Дата и время</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
            <Text>{date.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nowButton} onPress={() => setDate(new Date())}>
            <Text style={styles.nowText}>Сейчас</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}

        {/* Статус */}
        <Text style={styles.label}>Выберите статус</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedStatusId}
            onValueChange={(v) => setSelectedStatusId(v)}
            style={styles.picker}
          >
            <Picker.Item label="-- Выберите статус --" value="" />
            {statusDir.map((s) => (
              <Picker.Item key={s.status_id} label={s.name} value={s.status_id} />
            ))}
          </Picker>
        </View>

        {/* Заказчик */}
        <Text style={styles.label}>Выберите заказчика</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedClientId}
            onValueChange={(v) => setSelectedClientId(v)}
            style={styles.picker}
          >
            <Picker.Item label="-- Выберите заказчика --" value="" />
            {clients.map((c) => (
              <Picker.Item key={c.client_id} label={c.client} value={c.client_id} />
            ))}
          </Picker>
        </View>

        {/* Объём */}
        <Text style={styles.label}>Объём</Text>
        <TextInput
          style={styles.input}
          placeholder="например: 3"
          keyboardType="numeric"
          value={vol}
          onChangeText={setVol}
        />

        {/* Комментарий */}
        <Text style={styles.label}>Комментарий</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Введите текст"
          value={info}
          onChangeText={setInfo}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Отправить</Text>
        </TouchableOpacity>

        {/* История */}
        <Text style={styles.historyTitle}>История статусов</Text>
        <FlatList
          data={statuses}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.statusItem}>
              <Text>{item.stamp}</Text>
              <Text>{item.status}</Text>
              <Text>Объём: {item.vol}</Text>
              <Text>{item.text}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  nowButton: { marginLeft: 8, padding: 12, backgroundColor: '#4CAF50', borderRadius: 8 },
  nowText: { color: '#fff', fontWeight: '700' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: {
    height: 44,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700' },
  historyTitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  statusItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
});

export default FlightStatus;
