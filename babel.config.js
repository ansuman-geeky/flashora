module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@components': './src/components',
            '@features': './src/features',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@app-types': './src/types',
            '@hooks': './src/hooks',
            '@design-system': './src/design-system',
            '@modules': './src/modules',
          },
        },
      ],
      'react-native-worklets-core/plugin',
      ['react-native-reanimated/plugin', { processNestedWorklets: true }],
    ],
  };
};
