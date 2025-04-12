import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AppHeader from './AppHeader'; 

type Message = {
  id: string;
  text?: string;
  fileName?: string;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() !== '') {
      const newMessage: Message = { id: Date.now().toString(), text: input };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const sendFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileMessage: Message = {
          id: Date.now().toString(),
          fileName: file.name,
        };
        setMessages([...messages, fileMessage]);
      }
    } catch (error) {
      console.error('Ошибка при выборе файла:', error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageBubble}>
      {item.text && <Text style={styles.messageText}>{item.text}</Text>}
      {item.fileName && <Text style={styles.fileText}>📎 {item.fileName}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
        <AppHeader screenName="Чат" status="Активен" driverName="Иванов И.И." />
      <FlatList
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
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  chatContainer: { paddingBottom: 80 },
  messageBubble: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageText: { fontSize: 16 },
  fileText: { fontSize: 16, fontStyle: 'italic', color: '#00796b' },
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

export default ChatScreen;
