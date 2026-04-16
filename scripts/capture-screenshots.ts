import { chromium, type Browser } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "public", "screenshots");

const pages = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "projects", path: "/projects" },
  { slug: "blog", path: "/blog" },
  { slug: "resume", path: "/resume" },
  { slug: "contact", path: "/contact" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900, fullPage: true },
  { name: "mobile", width: 390, height: 844, fullPage: true },
] as const;

async function waitForServer(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

async function capture(browser: Browser) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
    });
    // Pre-dismiss the preloader so it doesn't overlay screenshots.
    await context.addInitScript(() => {
      try {
        window.sessionStorage.setItem("preloaded", "1");
      } catch {
        // ignore
      }
    });
    const page = await context.newPage();

    for (const p of pages) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`[${viewport.name}] ${url}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      await page.waitForTimeout(1200);

      // Scroll through the page to trigger whileInView animations,
      // then back to top for a clean full-page capture.
      await page.evaluate(`(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
        const end = document.documentElement.scrollHeight;
        for (let y = 0; y < end; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          await sleep(180);
        }
        window.scrollTo({ top: end, behavior: "instant" });
        await sleep(400);
        window.scrollTo({ top: 0, behavior: "instant" });
        await sleep(300);
      })()`);
      await page.waitForTimeout(800);

      const outPath = path.join(OUT_DIR, `${p.slug}-${viewport.name}.png`);
      await page.screenshot({ path: outPath, fullPage: viewport.fullPage });
      console.log(`  -> ${outPath}`);
    }

    await context.close();
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Waiting for ${BASE_URL} ...`);
  await waitForServer(BASE_URL);
  console.log("Server is up. Launching Chromium...");

  const browser = await chromium.launch();
  try {
    await capture(browser);
  } finally {
    await browser.close();
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
