module.exports = {
  env: {
    es2023: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: '2023',
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-unresolved': ['error', {
      ignore: ['conf'],
    }],
  },
};
