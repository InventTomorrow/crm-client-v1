const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: "/tmp/claude-1000/-home-aw-Documents-Dev-web-Projects-automated-crm--Baileys-/ce7db3b5-004b-4aca-ae56-6a508e9c85d0/scratchpad/auth.json" });
  const page = await context.newPage();
  page.on('console', msg => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));
  await page.goto("http://localhost:3000/channels/order-api", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log('bodyText:', (await page.textContent('body')).slice(0, 200));
  await browser.close();
})();
