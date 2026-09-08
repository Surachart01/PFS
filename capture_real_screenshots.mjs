import { spawn } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { createHmac } from "crypto";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9999;
const OUT_DIR = "deliverables/manual-assets/real";
mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate valid session tokens
const secret = "pfs-prod-secret-992384729";
function base64url(input) { return Buffer.from(input).toString("base64url"); }
function sign(value) { return createHmac("sha256", secret).update(value).digest("base64url"); }
function createSessionToken(payload) {
  const body = { ...payload, exp: Math.floor(Date.now()/1000) + 7*24*3600 };
  const encoded = base64url(JSON.stringify(body));
  return `${encoded}.${sign(encoded)}`;
}

const studentToken = createSessionToken({ userId: "6aa026ecea6edc08276d6d1e", role: "student" });
const adminToken = createSessionToken({ userId: "6a9bbbeff7cfcbb360d0acdd", role: "admin" });

async function getDebuggerUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch {}
    await sleep(300);
  }
  throw new Error("Cannot connect to Chrome remote debugging port");
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve) => {
      this.ws.onopen = resolve;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const msgId = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function capture() {
  console.log("Launching Chrome...");
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--user-data-dir=/tmp/chrome-real-pfs-cdp-2",
    "--window-size=1440,960",
    "--no-first-run",
    "--no-default-browser-check"
  ]);

  try {
    const wsUrl = await getDebuggerUrl();
    console.log("Connected to Chrome:", wsUrl);
    const browser = new CDPClient(wsUrl);

    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const targetWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${targetId}`;
    const page = new CDPClient(targetWsUrl);

    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 960,
      deviceScaleFactor: 2,
      mobile: false
    });

    // 1. Capture Login
    console.log("Capturing 01-real-login.png...");
    await page.send("Network.clearBrowserCookies");
    await page.send("Page.navigate", { url: "http://127.0.0.1:3000/login" });
    await sleep(2000);
    let ss = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT_DIR}/01-real-login.png`, Buffer.from(ss.data, "base64"));
    console.log("-> 01 done");

    // 2. Student Dashboard
    console.log("Capturing 02-real-student-dashboard.png...");
    await page.send("Network.clearBrowserCookies");
    await page.send("Network.setCookie", {
      name: "portfolio_session",
      value: studentToken,
      url: "http://127.0.0.1:3000"
    });
    await page.send("Page.navigate", { url: "http://127.0.0.1:3000/student" });
    await sleep(3000);
    ss = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT_DIR}/02-real-student-dashboard.png`, Buffer.from(ss.data, "base64"));
    console.log("-> 02 done");

    // 3. Student Editor
    console.log("Capturing 03-real-studio-editor.png...");
    await page.send("Page.navigate", { url: "http://127.0.0.1:3000/student/editor" });
    await sleep(3500);
    ss = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT_DIR}/03-real-studio-editor.png`, Buffer.from(ss.data, "base64"));
    console.log("-> 03 done");

    // 4. Admin Dashboard
    console.log("Capturing 04-real-admin-dashboard.png...");
    await page.send("Network.clearBrowserCookies");
    await page.send("Network.setCookie", {
      name: "portfolio_session",
      value: adminToken,
      url: "http://127.0.0.1:3000"
    });
    await page.send("Page.navigate", { url: "http://127.0.0.1:3000/admin" });
    await sleep(3000);
    ss = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT_DIR}/04-real-admin-dashboard.png`, Buffer.from(ss.data, "base64"));
    console.log("-> 04 done");

    // 5. Public Resume
    console.log("Capturing 05-real-public-dashboard.png...");
    await page.send("Network.clearBrowserCookies");
    await page.send("Page.navigate", { url: "http://127.0.0.1:3000/r/65010001" });
    await sleep(2500);
    ss = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT_DIR}/05-real-public-dashboard.png`, Buffer.from(ss.data, "base64"));
    console.log("-> 05 done");

    page.close();
    browser.close();
    console.log("All real screenshots captured successfully!");
  } finally {
    chrome.kill("SIGKILL");
  }
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
