# LaSalle Hardware Hub

Point-of-sale app for LaSalle Hardware. Built with Next.js and Tailwind CSS.

## Features

- Owner and cashier login. The first run asks you to create the owner account.
- Product grid with photos, categories, and search, plus add, edit, and delete for the owner.
- Cart with automatic totals, cash and change, and a receipt.
- Stock goes down on each sale, with a warning when fewer than 5 are left.
- 20% Senior/PWD discount.
- Sales history by day and cashier accounts for the owner.

Sample product photos are from Wikimedia Commons, with credits on the Products screen.

Data is saved in the browser's `localStorage`, so it stays on one device and browser. There is no backend, and clearing site data erases it.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Run the tests with `npm test`.

## Deploying to Railway

1. In Railway, create a new project and choose **Deploy from GitHub repo**.
2. Select `rsllmcrg/LaSalleHardwareHub` and the `main` branch.
3. Railway reads `railway.json`, builds with `npm run build`, and starts with `npm run start`.
4. Generate a public domain under **Settings → Networking** once the first deploy succeeds.

Next.js binds to the `PORT` variable Railway injects, so no extra configuration is needed.

## Building the Android APK

The APK wraps a static export of the app with Capacitor. It needs JDK 21 and the Android SDK.

```bash
npm run apk
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Updates install over the old app only when signed with the same key, so keep the signing keystore safe.
