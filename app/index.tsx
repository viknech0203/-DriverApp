import React from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import AuthScreen from "../src/AuthScreen";

export default function Index() {
  return (
    <Provider store={store}>
      <AuthScreen />
    </Provider>
  );
}
