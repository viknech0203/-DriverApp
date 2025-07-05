import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: string;
  text: string;
  sender: 'driver' | 'dispatcher';
  time: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 10000); // обновление каждые 10 секунд
    return () => clearInterval(interval);
  }, []);

  const fetchChat = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const rawHost = await AsyncStorage.getItem('server_host');

      if (!token || !rawHost) {
        throw new Error('Нет подключения к серверу');
      }

      const hostJson = JSON.parse(rawHost);

      const response = await fetch("https://app.atp-online.ru/driver_app/get_data.php", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: hostJson,
          endpoint: "api/v1/driver_mode/get_chat",
        }),
      });

      const text = await response.text();
      console.log('Ответ сервера:', text);

      if (!response.ok) {
        throw new Error(`Ошибка: ${text}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Сервер вернул не JSON');
      }

      const data = JSON.parse(text);

      const chatMessages: Message[] = Array.isArray(data)
        ? data.map((msg: any) => ({
            id: msg.id?.toString() ?? `${msg.time}-${Math.random()}`,
            text: msg.text || '',
            sender: msg.sender === 'dispatcher' ? 'dispatcher' : 'driver',
            time: msg.time || '',
          }))
        : [];

      setMessages(chatMessages);
      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e: any) {
      console.error('[ChatScreen] Ошибка:', e);
      Alert.alert('Ошибка', e.message || 'Не удалось загрузить чат');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: inputText,
      sender: 'driver',
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText('');

    try {
      const token = await AsyncStorage.getItem('access_token');
      const rawHost = await AsyncStorage.getItem('server_host');

      if (!token || !rawHost) throw new Error('Нет подключения');

      const host = JSON.parse(rawHost);

      const response = await fetch('https://app.atp-online.ru/driver_app/get_data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          host,
          endpoint: 'api/v1/driver_mode/send_chat',
          message: inputText,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ошибка отправки: ${text}`);
      }

      // Перезагрузим чат после отправки
      await fetchChat();
    } catch (e: any) {
      console.error('[ChatSend] Ошибка:', e);
      Alert.alert('Ошибка', e.message || 'Не удалось отправить сообщение');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === 'driver' ? styles.driverMessage : styles.dispatcherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.time}>{item.time.slice(11, 16)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#779DD6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ref={flatListRef}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите сообщение..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 10, paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  driverMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  dispatcherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F0F0',
  },
  messageText: {
    fontSize: 16,
  },
  time: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#779DD6',
    borderRadius: 20,
    padding: 10,
  },
});
