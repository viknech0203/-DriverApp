import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import AuthScreen from "../src/AuthScreen";
import MainScreen from "../src/MainScreen";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Provider store={store}>
      {" "}
      {/* Оборачиваем приложение в Provider */}
      {isAuthenticated ? (
        <MainScreen />
      ) : (
        <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </Provider>
  );
}
