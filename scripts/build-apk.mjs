// Builds the Android app in one go: static export, copy into the Android
// project, then Gradle. Needs JDK 21 and the Android SDK installed.
import { execSync } from "node:child_process";

const run = (command, options = {}) =>
  execSync(command, { stdio: "inherit", ...options });

run("npx next build", { env: { ...process.env, BUILD_TARGET: "apk" } });
run("npx cap sync android");
run(process.platform === "win32" ? ".\\gradlew.bat assembleDebug" : "./gradlew assembleDebug", {
  cwd: "android",
});

console.log("\nAPK ready: android/app/build/outputs/apk/debug/app-debug.apk");
