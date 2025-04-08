import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  // Убедитесь, что href правильно типизирован, если это динамический путь
  const resolvedHref = `./hooks/useColorScheme`;  // пример относительного пути

  return (
    <Link
      target="_blank"
      {...rest}
      href={resolvedHref}  // Использование правильно типизированного пути
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(resolvedHref);
        }
      }}
    />
  );
}
