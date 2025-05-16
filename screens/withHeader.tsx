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
          const baseUrl = await AsyncStorage.getItem("base_url");
          const token = await AsyncStorage.getItem("access_token");
          if (!baseUrl || !token) return;
          const resp = await fetch(`${baseUrl}/get_info`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: "{}",
          });
          const data = await resp.json();
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
