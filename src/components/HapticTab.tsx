import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { GestureResponderEvent } from 'react-native';  // Импортируем нужный тип

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {  // Указываем тип для ev
        if (process.env.EXPO_OS === 'ios') {
          // Добавляем мягкую тактильную отдачу при нажатии на вкладки.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
