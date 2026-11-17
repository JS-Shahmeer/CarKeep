const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Drizzle's Expo SQLite migrator imports the generated .sql files directly
// (see src/db/migrations/migrations.js) — Metro needs to treat them as source.
config.resolver.sourceExts.push("sql");

module.exports = config;
