# LaSalle Hardware Hub

Inventory, orders, and supplier management for LaSalle Hardware. Built with Next.js and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Railway

1. In Railway, create a new project and choose **Deploy from GitHub repo**.
2. Select `rsllmcrg/LaSalleHardwareHub` and the `main` branch.
3. Railway reads `railway.json`, builds with `npm run build`, and starts with `npm run start`.
4. Generate a public domain under **Settings → Networking** once the first deploy succeeds.

Next.js binds to the `PORT` variable Railway injects, so no extra configuration is needed.
