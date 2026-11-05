import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Android keeps the shop's saved data under this id, so it must never change.
  appId: "com.lasallehardware.hub",
  appName: "LaSalle Hardware Hub",
  webDir: "out",
};

export default config;
