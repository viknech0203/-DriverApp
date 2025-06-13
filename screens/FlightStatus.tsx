import React, { useState, useEffect } from "react";
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
import AppHeader from "./AppHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import {
  Driver,
  TrackClient,
  InfoResponse,
  DirResponse,
  HistoryResponse,
  SetStatusResponse,
} from './types';

const FlightStatus: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusDir, setStatusDir] = useState<{ status_id: string; name: string }[]>([]);
  const [clients, setClients] = useState<TrackClient[]>([]);
  const [raznId, setRaznId] = useState<string>("");
  const [dataId, setDataId] = useState<string>("");
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [vol, setVol] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [raznZakId, setRaznZakId] = useState<string>("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem("base_url");
        const token = await AsyncStorage.getItem("access_token");
        if (!baseUrl || !token) throw new Error("Нет baseUrl или token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const infoResp = await fetch(`${baseUrl}/get_info`, {
          method: "POST",
          headers,
          body: "{}",
        });
        const infoJson = await infoResp.json() as InfoResponse;

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

        setRaznId(infoJson.route?.[0]?.razn_id || "");

        const dirResp = await fetch(`${baseUrl}/get_status_dir`, {
          method: "POST",
          headers,
          body: "{}",
        });
        const dirJson = await dirResp.json() as DirResponse;

        setStatusDir(
          dirJson.status_dir.map((s: any) => ({
            status_id: String(s.status_id),
            name: s.name,
          }))
        );

        const firstTrack = infoJson.route?.[0]?.track?.[0];
        if (firstTrack?.razn_zak_id) {
          setRaznZakId(String(firstTrack.razn_zak_id));
        }
      } catch (e) {
        console.error("Ошибка загрузки initial data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStatusHistory();
  }, [raznZakId, statusDir]);

  const fetchStatusHistory = async () => {
    if (!raznZakId) return;

    try {
      const baseUrl = await AsyncStorage.getItem("base_url");
      const token = await AsyncStorage.getItem("access_token");
      if (!baseUrl || !token) throw new Error("Нет baseUrl или токена");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const historyResp = await fetch(`${baseUrl}/get_status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ razn_zak_id: raznZakId }),
      });

      const historyJson = await historyResp.json() as HistoryResponse;

      const sorted = (historyJson.status_list || []).sort((a, b) =>
        new Date(b.stamp).getTime() - new Date(a.stamp).getTime()
      );

      const uniqueStatuses = Array.from(
        new Map(sorted.map(s => [s.stamp + s.status, s])).values()
      );

      setStatuses(uniqueStatuses);

      const lastStatus = uniqueStatuses[0]?.status;
      const matched = statusDir.find((s) => s.name === lastStatus);
      if (matched) setSelectedStatusId(String(matched.status_id));
    } catch (e) {
      console.error("Ошибка при загрузке истории статусов:", e);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatusId || !selectedClientId || !raznId || !raznZakId) {
      console.warn("Все поля должны быть заполнены");
      return;
    }

    try {
      const baseUrl = await AsyncStorage.getItem("base_url");
      const token = await AsyncStorage.getItem("access_token");
      if (!baseUrl || !token) throw new Error("Нет baseUrl или токена");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const body = {
        apply_stamp_status: date.toISOString().slice(0, 19).replace("T", " "),
        status_id: selectedStatusId,
        client_id: selectedClientId,
        razn_id: raznId,
        vol,
        info,
      };

      const resp = await fetch(`${baseUrl}/set_status`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await resp.json() as SetStatusResponse;

      if (result.status?.code === 0) {
        console.log("Статус успешно установлен");
        setVol("");
        setInfo("");
        await fetchStatusHistory();
      } else {
        console.error("Ошибка при установке статуса:", result.status?.text);
      }
    } catch (error) {
      console.error("Ошибка отправки статуса:", error);
    }
  };

  const showAndroidDateTimePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      is24Hour: true,
      display: "default",
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const newDate = new Date(date);
          newDate.setFullYear(selectedDate.getFullYear());
          newDate.setMonth(selectedDate.getMonth());
          newDate.setDate(selectedDate.getDate());

          DateTimePickerAndroid.open({
            value: newDate,
            mode: "time",
            is24Hour: true,
            display: "default",
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type === "set" && selectedTime) {
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
                onPress={() => {
                  if (Platform.OS === "android") {
                    showAndroidDateTimePicker();
                  } else {
                    setShowDatePicker(true);
                  }
                }}
              >
                <Text>{date.toLocaleString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nowButton}
                onPress={() => {
                  const now = new Date();
                  setDate(now);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.nowText}>Сейчас</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && Platform.OS === "ios" && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="inline"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Выберите статус</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedStatusId}
                onValueChange={setSelectedStatusId}
                style={styles.picker}
              >
                <Picker.Item label="-- Выберите статус --" value="" />
                {statusDir.map((s) => (
                  <Picker.Item key={s.status_id} label={s.name} value={s.status_id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Выберите заказчика</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedClientId}
                onValueChange={setSelectedClientId}
                style={styles.picker}
              >
                <Picker.Item label="-- Выберите заказчика --" value="" />
                {clients.map((c) => (
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
              style={[styles.submitButton, (!selectedStatusId || !selectedClientId || !raznId || !raznZakId) && { opacity: 0.5 }]}
              disabled={!selectedStatusId || !selectedClientId || !raznId || !raznZakId}
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
        contentContainerStyle={{ padding: 16 }}
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
