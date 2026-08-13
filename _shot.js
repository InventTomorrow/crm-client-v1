const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const OUT = process.env.OUT_DIR || "/tmp/claude-1000/-home-aw-Documents-Dev-web-Projects-automated-crm--Baileys-/ce7db3b5-004b-4aca-ae56-6a508e9c85d0/scratchpad/shots";
const AUTH_STATE = "/tmp/claude-1000/-home-aw-Documents-Dev-web-Projects-automated-crm--Baileys-/ce7db3b5-004b-4aca-ae56-6a508e9c85d0/scratchpad/auth.json";
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

const PATHS = process.argv.slice(2);

(async () => {
  const fs = require("fs");
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORTS.desktop, storageState: AUTH_STATE });
  const page = await context.newPage();

  for (const path of PATHS) {
    for (const [name, size] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(size);
      try {
        await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 15000 });
      } catch (e) {}
      await page.waitForTimeout(1000);
      const fname = path.replace(/\//g, "_") || "_root";
      await page.screenshot({ path: `${OUT}/${fname}__${name}.png`, fullPage: true });
    }
  }

  await browser.close();
  console.log("done");
})();
