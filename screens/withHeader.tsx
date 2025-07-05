import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from './AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver } from './types';

export function withHeader(Component: React.ComponentType<any>, title: string) {
  return (props: any) => {
    const [driver, setDriver] = React.useState<Driver | undefined>();
    const [menuOpen, setMenuOpen] = React.useState(false);

    React.useEffect(() => {
      const loadDriver = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const rawHost = await AsyncStorage.getItem("server_host");

    if (!token || !rawHost) return;

    const hostJson = JSON.parse(rawHost);

    const response = await fetch("https://app.atp-online.ru/driver_app/get_data.php", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: {
          ip: hostJson.ip,
          port: hostJson.port,
          is_ssl_port: hostJson.is_ssl_port,
          endpoint: "api/v1/driver_mode/get_info", // как в примере
        },
      }),
    });

    const data = await response.json();

    if (data?.driver) {
      setDriver(data.driver);
    }
  } catch (e) {
    console.error("Ошибка загрузки водителя:", e);
  }
};

      loadDriver();
    }, []);

    return (
      <View style={{ flex: 1 , overflow: 'visible'}}>
        <AppHeader
          screenName={title}
          // status="Активен"
          driverName={driver?.fio}
          driver={driver}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen(prev => !prev)}
        />
        <View style={{ flex: 1 }}>
          <Component {...props} driver={driver} />
        </View>
      </View>
    );
  };
}
