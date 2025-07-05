import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Driver, TrackClient, InfoResponse, DirResponse, HistoryResponse, SetStatusResponse } from "./types";
import { StatusHistoryItem } from "./types";



const FlightStatus = () => {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [statusDir, setStatusDir] = useState<{ status_id: string; name: string }[]>([]);
  const [clients, setClients] = useState<TrackClient[]>([]);
  const [statuses, setStatuses] = useState<StatusHistoryItem[]>([]);

  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [vol, setVol] = useState("");
  const [info, setInfo] = useState("");

  const [raznId, setRaznId] = useState("");
  const [raznZakId, setRaznZakId] = useState("");

  const getAuthHeaders = async () => {
    const baseUrl = await AsyncStorage.getItem("base_url");
    const token = await AsyncStorage.getItem("access_token");

    if (!baseUrl || !token) throw new Error("Нет base_url или access_token");

    return {
      baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

 const fetchInitialData = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const storedHost = await AsyncStorage.getItem("server_host");

    if (!token || !storedHost) throw new Error("Нет токена или хоста");

    const hostJson = JSON.parse(storedHost);

    const infoResp = await fetch("https://app.atp-online.ru/driver_app/get_data.php", {
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
          endpoint: "api/v1/driver_mode/get_info",
        },
      }),
    });

    const infoJson: InfoResponse = await infoResp.json();

    const clientsList = (infoJson.route || [])
      .flatMap(r => r.track || [])
      .filter(t => t.client_id && t.client)
      .map(t => ({ client_id: String(t.client_id), client: t.client }));

    const uniqueClients = Array.from(new Map(clientsList.map(c => [c.client_id, c])).values());
    setClients(uniqueClients);
    setSelectedClientId(uniqueClients[0]?.client_id || "");

    setRaznId(infoJson.route?.[0]?.razn_id || "");
    setRaznZakId(infoJson.route?.[0]?.track?.[0]?.razn_zak_id || "");

    // Запрос справочника
    const baseUrl = await AsyncStorage.getItem("base_url");
    if (!baseUrl) throw new Error("base_url не найден");

    const dirResp = await fetch(`${baseUrl}/get_status_dir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const dirJson: DirResponse = await dirResp.json();

    const statusOptions = dirJson.status_dir.map(s => ({
      status_id: String(s.status_id),
      name: s.name,
    }));
    setStatusDir(statusOptions);
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  } finally {
    setLoading(false);
  }
};


  const fetchStatusHistory = async () => {
    if (!raznZakId) return;

    try {
      const { baseUrl, headers } = await getAuthHeaders();

      const response = await fetch(`${baseUrl}/get_status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ razn_zak_id: raznZakId }),
      });
      const json: HistoryResponse = await response.json();

      const sorted = (json.status_list || []).sort((a, b) =>
        new Date(b.stamp).getTime() - new Date(a.stamp).getTime()
      );

      const uniqueStatuses = Array.from(new Map(sorted.map(s => [s.stamp + s.status, s])).values());
      setStatuses(uniqueStatuses);

      const lastStatus = uniqueStatuses[0]?.status;
      const matched = statusDir.find(s => s.name === lastStatus);
      if (matched) setSelectedStatusId(matched.status_id);
    } catch (err) {
      console.error("Ошибка получения истории:", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatusId || !selectedClientId || !raznId || !raznZakId) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      const { baseUrl, headers } = await getAuthHeaders();

      const body = {
        apply_stamp_status: date.toISOString().slice(0, 19).replace("T", " "),
        status_id: selectedStatusId,
        client_id: selectedClientId,
        razn_id: raznId,
        vol,
        info,
      };

      const response = await fetch(`${baseUrl}/set_status`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result: SetStatusResponse = await response.json();

      if (result.status?.code === 0) {
        setVol("");
        setInfo("");
        await fetchStatusHistory();
      } else {
        alert("Ошибка: " + result.status?.text);
      }
    } catch (err) {
      console.error("Ошибка отправки:", err);
    }
  };

  const showAndroidDateTimePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      is24Hour: true,
      onChange: (_, selectedDate) => {
        if (selectedDate) {
          const newDate = new Date(selectedDate);
          DateTimePickerAndroid.open({
            value: newDate,
            mode: "time",
            is24Hour: true,
            onChange: (_, selectedTime) => {
              if (selectedTime) {
                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());
                setDate(newDate);
              }
            },
          });
        }
      },
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStatusHistory();
  }, [raznZakId, statusDir]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={statuses}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={
          <>
            <Text style={styles.label}>Дата и время</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => (Platform.OS === "android" ? showAndroidDateTimePicker() : setShowDatePicker(true))}
              >
                <Text>{date.toLocaleString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nowButton} onPress={() => setDate(new Date())}>
                <Text style={styles.nowText}>Сейчас</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && Platform.OS === "ios" && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="inline"
                onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
              />
            )}

            <Text style={styles.label}>Выберите статус</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedStatusId} onValueChange={setSelectedStatusId}>
                <Picker.Item label="-- Статус --" value="" />
                {statusDir.map(s => (
                  <Picker.Item key={s.status_id} label={s.name} value={s.status_id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Выберите заказчика</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedClientId} onValueChange={setSelectedClientId}>
                <Picker.Item label="-- Заказчик --" value="" />
                {clients.map(c => (
                  <Picker.Item key={c.client_id} label={c.client} value={c.client_id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Объём</Text>
            <TextInput
              style={styles.input}
              placeholder="например: 3"
              keyboardType="numeric"
              value={vol}
              onChangeText={setVol}
            />

            <Text style={styles.label}>Комментарий</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Введите текст"
              value={info}
              onChangeText={setInfo}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitButton, (!selectedStatusId || !selectedClientId) && { opacity: 0.5 }]}
              disabled={!selectedStatusId || !selectedClientId}
              onPress={handleStatusUpdate}
            >
              <Text style={styles.submitText}>Отправить</Text>
            </TouchableOpacity>

            <Text style={styles.historyTitle}>История статусов</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.statusItem}>
            <Text>{item.stamp}</Text>
            <Text>{item.status}</Text>
            <Text>Объём: {item.vol}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  nowButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  nowText: { color: "#fff", fontWeight: "700" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: { height: 44, width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  statusItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
});

export default FlightStatus;
