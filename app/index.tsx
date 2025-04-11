import React, { useState } from 'react';
import AuthScreen from '../src/screens/AuthScreen';
import MainScreen from '../src/screens/MainScreen';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <MainScreen />
  ) : (
    <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}
