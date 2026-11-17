module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Inlines the generated .sql migration files as string constants —
      // Metro's JS transformer can't parse raw SQL, so the import must be
      // resolved at the Babel level instead (see src/db/migrations).
      ["inline-import", { extensions: [".sql"] }],
      "react-native-reanimated/plugin",
    ],
  };
};
