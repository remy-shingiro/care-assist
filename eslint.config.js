const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
  },
];
