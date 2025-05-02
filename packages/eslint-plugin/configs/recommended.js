module.exports = {
  plugins: ['@juncern/eslint-plugin'],
  rules: {
    '@juncern/eslint-plugin/no-http-url': 'warn',
    '@juncern/eslint-plugin/no-secret-info': [
      "error",
      {
        dangerousKeys: ["secret"],
        autoMerge: true,
      },
    ],
  },
};
