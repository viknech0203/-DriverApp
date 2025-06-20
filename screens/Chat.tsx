import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import AppHeader from "./AppHeader";
import { Driver, ChatResponse, InfoResponse } from "./types";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from 'uuid';

type Message = {
  id: string;
  text?: string;
  fileName?: string;
  fileUri?: string;
  author: "V" | "D";
  stamp: string;
};

// Удаление дубликатов по ID (driver_chat_key)
const mergeMessagesByServerId = (
  oldMessages: Message[],
  newMessages: Message[]
): Message[] => {
  const seen = new Set<string>();
  const combined = [...oldMessages, ...newMessages];

  const unique = combined.filter((msg) => {
    if (!msg.id) return false;
    if (seen.has(msg.id)) return false;
    seen.add(msg.id);
    return true;
  });

  return unique.sort(
    (a, b) => new Date(a.stamp).getTime() - new Date(b.stamp).getTime()
  );
};





const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem("base_url");
        const token = await AsyncStorage.getItem("access_token");
        if (!baseUrl || !token) {
          return;
        }
        const resp = await fetch(`${baseUrl}/get_info`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        });
        const data = (await resp.json()) as InfoResponse;
        if (data?.driver) {
          setDriver(data.driver);
        }
      } catch (e) {
        console.error("Ошибка загрузки данных водителя:", e);
      }
    };

    fetchDriver();
  }, []);

  useEffect(() => {
    if (isAtBottom && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchChat = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem("base_url");
      const token = await AsyncStorage.getItem("access_token");
      if (!baseUrl || !token) {
        Alert.alert("Ошибка", "Нет данных для подключения");
        return;
      }

      const body = lastMessageId ? { last_id: lastMessageId } : {};
      console.log(" Отправляю запрос на /get_chat с last_id:", lastMessageId);

      const resp = await fetch(`${baseUrl}/get_chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await resp.json()) as ChatResponse;

      if (data?.chat && data.chat.length > 0) {
        console.log(` Получено ${data.chat.length} сообщений от сервера:`);

        // Логируем ID всех сообщений
        data.chat.forEach((item, index) => {
          const id = item.id?.toString() || item.driver_chat_key?.toString();
          console.log(
            `  [${index}] id: ${id}, автор: ${item.autor}, дата: ${item.stamp}`
          );
        });

 const newMessages = data.chat.map((item: any) => ({
  id: (item.id ?? item.driver_chat_key ?? new Date(item.stamp).getTime()).toString(),
  text: item.chat_msg,
  fileName: item.file_name,
  fileUri: item.file_
    ? `data:image/jpeg;base64,${item.file_}`
    : undefined,
  author: item.autor,
  stamp: item.stamp,
}));



        setMessages((prev) => {
          const withoutTemps = prev.filter((m) => !m.id.startsWith("temp-"));
          const combined = mergeMessagesByServerId(withoutTemps, newMessages);
          console.log(
            ` Добавлено ${combined.length - prev.length} новых сообщений`
          );
          return combined;
        });

        const newLastId = data.chat[data.chat.length - 1].id?.toString();
        if (newLastId) {
          console.log(" Новый lastMessageId:", newLastId);
          setLastMessageId(newLastId);
          await AsyncStorage.setItem("last_message_id", newLastId);
        }
      } else {
        console.log(" Нет новых сообщений от сервера.");
      }
    } catch (error: any) {
      console.error(" Ошибка при получении чата:", error.message || error);
      Alert.alert("Ошибка", error.message || "Не удалось загрузить чат");
    } finally {
      setLoading(false);
    }
    const checkSaved = await AsyncStorage.getItem("last_message_id");
  console.log(" Проверка сохранения: ", checkSaved);
  };

  useEffect(() => {
    let interval: any;

    const init = async () => {
      const storedId = await AsyncStorage.getItem("last_message_id");
      if (storedId) {
        setLastMessageId(storedId);
      }
      await fetchChat();

      // Запускаем интервал только после первого запроса
      interval = setInterval(fetchChat, 10000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

 const sendMessage = async () => {
  const baseUrl = await AsyncStorage.getItem("base_url");
  const token = await AsyncStorage.getItem("access_token");

  if (!baseUrl || !token) {
    Alert.alert("Ошибка", "Нет данных для подключения");
    return;
  }

  // Отправка текста
  if (input.trim()) {
    // const tempId = new Date().getTime().toString();
    const tempId = `temp-${new Date().getTime()}`;
    const tempMessage: Message = {
      id: tempId,
      text: input,
      author: "V",
      stamp: new Date().toISOString(),
    };

    // Добавляем временное сообщение
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const resp = await fetch(`${baseUrl}/set_chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: input }),
      });

      const data: ChatResponse = await resp.json();

      if (data?.chat) {
 const updatedMessages = data.chat.map((item: any) => ({
  id: item.driver_chat_key
    ? item.driver_chat_key.toString()
    : new Date(item.stamp).getTime().toString(),
  text: item.chat_msg,
  author: item.autor,
  stamp: item.stamp,
}));




    setMessages((prev) => {
      const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp-"));
      return mergeMessagesByServerId(prev, updatedMessages);
    });

    setInput(""); // Очищаем поле ввода
  }
} catch (error: any) {
  Alert.alert("Ошибка", error.message || "Не удалось отправить сообщение");
}
  }
    // Отправка файлов
    for (const asset of files) {
      try {
        const fileName =
          asset.name || asset.uri?.split("/").pop() || "upload.dat";
        const mimeType = asset.mimeType || "application/octet-stream";

        console.log(" Готовим файл к отправке:", {
          name: fileName,
          uri: asset.uri,
          type: mimeType,
        });

        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as any);

        const response = await fetch(`${baseUrl}/send_file`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData as any,
        });

        const responseData = await response.json().catch(() => ({}));
        console.log(" Ответ от сервера:", response.status, responseData);

        if (response.ok) {
       setMessages((prev) => [
  ...prev,
  {
    id: new Date().getTime().toString(),
    fileName,
    fileUri: asset.uri,
    author: "V",
    stamp: new Date().toISOString(),
  },
]);

        } else {
          Alert.alert("Ошибка", `Файл ${fileName} не отправлен`);
        }
      } catch (error) {
        console.error(" Ошибка при отправке файла:", error);
        Alert.alert("Ошибка", "Не удалось отправить файл");
      }
    }

    setFiles([]);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "*/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.assets || result.assets.length === 0) return;

      const updatedAssets = result.assets.map((asset) => {
        const nameFromUri = asset.uri?.split("/").pop();
        const finalName = asset.name || nameFromUri || "unnamed_file.dat";
        console.log("📎 Выбран файл:", {
          name: finalName,
          uri: asset.uri,
          mimeType: asset.mimeType,
        });
        return {
          ...asset,
          name: finalName,
        };
      });

      setFiles(updatedAssets);
    } catch (error) {
      console.error(" Ошибка при выборе файла:", error);
      Alert.alert("Ошибка", "Не удалось выбрать файл");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Ошибка", "Требуется доступ к камере");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const fileName =
          photo.fileName || photo.uri.split("/").pop() || "photo.jpg";

        setFiles((prev) => [
          ...prev,
          {
            uri: photo.uri,
            name: fileName,
            mimeType: "image/jpeg",
          },
        ]);
      }
    } catch (error) {
      console.error("Ошибка при съемке фото:", error);
      Alert.alert("Ошибка", "Не удалось открыть камеру");
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isImage = item.fileName?.match(/\.(jpg|jpeg|png|gif)$/i);

    return (
      <View
        style={[
          styles.messageBubble,
          item.author === "V" ? styles.driverBubble : styles.dispatcherBubble,
        ]}
      >
        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
        {isImage && item.fileUri ? (
          <Image
            source={{ uri: item.fileUri }}
            style={{ width: 200, height: 200, borderRadius: 10, marginTop: 5 }}
            resizeMode="cover"
          />
        ) : (
          item.fileName && (
            <Text style={styles.fileText}>📎 {item.fileName}</Text>
          )
        )}
        <Text style={styles.timeStamp}>{item.stamp}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
    

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
       keyExtractor={(item) => item.id}


        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
          const paddingToBottom = 40;
          const isBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
          setIsAtBottom(isBottom);
        }}
        scrollEventThrottle={100}
      />

      {files.length > 0 && (
        <View style={{ padding: 10 }}>
          {files.map((file) => (
            <View key={file.name} style={{ marginBottom: 5 }}>
              <Text>📎 {file.name}</Text>
              <View
                style={{ height: 5, backgroundColor: "#ccc", borderRadius: 5 }}
              >
                <View
                  style={{
                    width: `${uploadProgress[file.name] || 0}%`,
                    backgroundColor: "#4CAF50",
                    height: "100%",
                    borderRadius: 5,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}

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
        <TouchableOpacity
          style={[styles.button, styles.fileButton]}
          onPress={pickFile}
        >
          <Text style={styles.buttonText}>📎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF5722" }]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>📷</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: { paddingBottom: 80, paddingHorizontal: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  driverBubble: {
    backgroundColor: "#e0f7fa",
    alignSelf: "flex-end",
  },
  dispatcherBubble: {
    backgroundColor: "#ffe0b2",
    alignSelf: "flex-start",
  },
  messageText: { fontSize: 16 },
  fileText: { fontSize: 16, fontStyle: "italic", color: "#00796b" },
  timeStamp: { fontSize: 10, color: "#999", marginTop: 5 },
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  fileButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Chat;
