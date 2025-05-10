import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser'; // для открытия браузера
import { Linking } from 'react-native'; // для работы с ссылками

type Props = {
  href: string;
  children: React.ReactNode;
};

export function ExternalLink({ href, children }: Props) {
  const resolvedHref = href;  // Динамически передаваемый путь или внешний URL

  const handlePress = async (event: any) => {
    if (Platform.OS !== 'web') {
      // Prevent default browser behavior in native apps
      event.preventDefault();
      // Open the link in an in-app browser
      await openBrowserAsync(resolvedHref);
    } else {
      // Если на вебе, используем стандартное поведение
      Linking.openURL(resolvedHref);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
