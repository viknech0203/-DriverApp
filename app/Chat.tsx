import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import AppHeader from './AppHeader';
import { Driver } from './types';

type Message = {
  id: string;
  text?: string;
  fileName?: string;
  author: 'V' | 'D';
  stamp: string;
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem('base_url');
        const token = await AsyncStorage.getItem('access_token');
        if (!baseUrl || !token) {
          return;
        }
        const resp = await fetch(`${baseUrl}/get_info`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: '{}',
        });
        const data = await resp.json();
        if (data?.driver) {
          setDriver(data.driver);
        }
      } catch (e) {
        console.error('Ошибка загрузки данных водителя:', e);
      }
    };

    fetchDriver();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchChat = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('base_url');
      const token = await AsyncStorage.getItem('access_token');
      if (!baseUrl || !token) {
        Alert.alert('Ошибка', 'Нет данных для подключения');
        return;
      }
      const resp = await fetch(`${baseUrl}/get_chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (data?.chat) {
        const fetchedMessages = data.chat.map((item: any) => ({
          id: item.driver_chat_key.toString(),
          text: item.chat_msg,
          author: item.autor,
          stamp: item.stamp,
        }));
        setMessages(fetchedMessages);
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось загрузить чат');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    try {
      const baseUrl = await AsyncStorage.getItem('base_url');
      const token = await AsyncStorage.getItem('access_token');
      if (!baseUrl || !token) {
        Alert.alert('Ошибка', 'Нет данных для подключения');
        return;
      }

      const resp = await fetch(`${baseUrl}/set_chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: input }),
      });

      const data = await resp.json();
      if (data?.chat) {
        const updatedMessages = data.chat.map((item: any) => ({
          id: item.driver_chat_key.toString(),
          text: item.chat_msg,
          author: item.autor,
          stamp: item.stamp,
        }));
        setMessages(updatedMessages);
        setInput('');
      } else {
        Alert.alert('Ошибка', 'Некорректный формат ответа сервера');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось отправить сообщение');
    }
  };

  const sendFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newFileMessage: Message = {
          id: Date.now().toString(),
          fileName: file.name,
          author: 'V',
          stamp: new Date().toLocaleString(),
        };
        setMessages((prev) => [...prev, newFileMessage]);
      }
    } catch (error) {
      console.error('Ошибка выбора файла:', error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.author === 'V' ? styles.driverBubble : styles.dispatcherBubble,
    ]}>
      {item.text && <Text style={styles.messageText}>{item.text}</Text>}
      {item.fileName && <Text style={styles.fileText}>📎 {item.fileName}</Text>}
      <Text style={styles.timeStamp}>{item.stamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {driver && (
        <AppHeader
          screenName="Информация о рейсе"
          status=""
          driverName={driver.fio}
          driver={driver}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Введите сообщение..."
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Отпр.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.fileButton]} onPress={sendFile}>
          <Text style={styles.buttonText}>📎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatContainer: { paddingBottom: 80, paddingHorizontal: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  driverBubble: {
    backgroundColor: '#e0f7fa',
    alignSelf: 'flex-start',
  },
  dispatcherBubble: {
    backgroundColor: '#ffe0b2',
    alignSelf: 'flex-end',
  },
  messageText: { fontSize: 16 },
  fileText: { fontSize: 16, fontStyle: 'italic', color: '#00796b' },
  timeStamp: { fontSize: 10, color: '#999', marginTop: 5 },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  fileButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chat;
