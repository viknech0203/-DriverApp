import React, { useState } from 'react';
import AuthScreen from '../src/AuthScreen';
import MainScreen from '../src/MainScreen';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <MainScreen />
  ) : (
    <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}
