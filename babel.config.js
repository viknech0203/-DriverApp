module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@': './src',
      },
    }],
  ],
};
