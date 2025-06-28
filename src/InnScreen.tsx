import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { fetchServerInfo, setInn } from "../store/authSlice";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../screens/types";
import type { AppDispatch } from "../store/store";

const InnScreen: React.FC = () => {
  const [inn, setInnValue] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    try {
      const baseUrl = await dispatch(fetchServerInfo(inn)).unwrap();
      dispatch(setInn(inn));
      console.log("baseUrl установлен:", baseUrl);
      navigation.navigate("AuthScreen"); // переход к экрану логина
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.message || "Не удалось получить информацию о сервере"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Введите ИНН</Text>
        <TextInput
          style={styles.input}
          placeholder="ИНН"
          value={inn}
          onChangeText={setInnValue}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Продолжить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InnScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#498DCA",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
