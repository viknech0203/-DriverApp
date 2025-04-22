// app/DriverInfo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DriverInfo = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Информация о водителе</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, fontWeight: 'bold' },
});

export default DriverInfo;
