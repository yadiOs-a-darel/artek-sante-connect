const path = require("path");
const fs = require("fs");

/** Charge EXPO_PUBLIC_* depuis un fichier .env (sans dépendance dotenv). */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key.startsWith("EXPO_PUBLIC_") && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Monorepo : .env racine, puis surcharge apps/mobile/.env
loadEnvFile(path.resolve(__dirname, "../../.env"));
loadEnvFile(path.resolve(__dirname, ".env"));

const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
    },
  },
};
