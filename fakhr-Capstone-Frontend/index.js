if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}

try {
  const { TurboModuleRegistry } = require("react-native");
  const core = TurboModuleRegistry.get("ExpoModulesCore");
  console.log("[boot] expo=", !!globalThis.expo, "window=", typeof window, "core=", !!core);
  if (core?.installModules) {
    core.installModules();
  }
  console.log("[boot] after install expo=", !!globalThis.expo);
} catch (error) {
  console.log("[boot] install failed", error);
}

require("expo-router/entry");
