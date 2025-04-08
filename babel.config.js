module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin', // Добавлено для работы с Reanimated
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@': './src', // Алиас для src
      },
    }],
  ],
};
