module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['import'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};