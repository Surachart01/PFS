import assert from "node:assert/strict";
import { randomFillSync } from "node:crypto";
import { chromium } from "playwright";
import { MongoClient, ObjectId } from "mongodb";
import sharp from "sharp";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3002";
assert.match(baseURL, /^http:\/\/localhost:3002\/?$/, "E2E must target the isolated test server on port 3002");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
});
const errors = [];

async function login(page, identifier, password) {
  const response = await page.request.post(`${baseURL}/api/auth/login`, { data: { identifier, password } });
  assert.equal(response.status(), 200, await response.text());
}

try {
  const admin = await browser.newPage();
  await login(admin, "admin-test@kmitl.ac.th", "DemoAdmin123");
  const studentId = `demo${Date.now().toString().slice(-9)}`;
  const studentPassword = "DemoStudent123";
  const created = await admin.request.post(`${baseURL}/api/students`, { data: {
    studentId, firstName: "Demo", lastName: "Student", email: `${studentId}@kmitl.ac.th`,
    password: studentPassword, department: "Computer Engineering", year: 4
  } });
  assert.equal(created.status(), 201, await created.text());
  const testStudent = { id: (await created.json()).id };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));
  await login(page, studentId, studentPassword);
  await page.goto(`${baseURL}/student/editor`);
  await page.locator(".rs-rnd").first().waitFor();
  const initial = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  assert.equal(initial.layoutVersion, 1);
  assert.ok(initial.sections.length >= 6);

  const duplicate = structuredClone(initial);
  duplicate.sections.push({ ...duplicate.sections[1], id: duplicate.sections[1].id });
  const invalid = await page.request.put(`${baseURL}/api/portfolio/me`, { data: duplicate });
  assert.equal(invalid.status(), 400, "duplicate IDs must be rejected");

  for (const targetZoom of [50, 100, 150]) {
    while (Number((await page.locator(".rs-zoom-label").innerText()).replace("%", "")) > targetZoom) {
      await page.getByRole("button", { name: "ซูมออก" }).click();
    }
    while (Number((await page.locator(".rs-zoom-label").innerText()).replace("%", "")) < targetZoom) {
      await page.getByRole("button", { name: "ซูมเข้า" }).click();
    }
    const before = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections[0].frame;
    const box = await page.locator(".rs-rnd").first().boundingBox();
    assert.ok(box);
    const direction = before.x + before.width + 24 > 794 ? -1 : 1;
    const delta = direction * 24 * targetZoom / 100;
    const dragY = box.y + Math.min(box.height - 25, Math.max(60, box.height * .7));
    await page.mouse.move(box.x + 30, dragY);
    await page.mouse.down();
    await page.mouse.move(box.x + 30 + delta, dragY, { steps: 8 });
    await page.mouse.up();
    await page.getByRole("button", { name: "บันทึก", exact: true }).click();
    await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
    const after = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections[0].frame;
    assert.ok(Math.abs((after.x - before.x) - direction * 24) <= 8, `zoom ${targetZoom}% drag delta=${after.x - before.x}`);
  }
  await page.locator(".rs-rnd").nth(1).click({ position: { x: 25, y: 35 } });
  const firstBeforeResize = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections[1].frame;
  const resizeHandle = page.locator('.rs-rnd.selected > div:last-child > div[style*="se-resize"]');
  await resizeHandle.scrollIntoViewIfNeeded();
  const handle = await resizeHandle.boundingBox();
  assert.ok(handle, "selected block must have a resize handle");
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 - 36, handle.y + handle.height / 2 - 24, { steps: 8 });
  await page.mouse.up();
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const firstAfterResize = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections[1].frame;
  assert.ok(firstAfterResize.width < firstBeforeResize.width, "resize must persist");
  await page.screenshot({ path: new URL("./editor-zoom150.png", import.meta.url).pathname, fullPage: false });
  await page.getByRole("button", { name: "พอดีหน้าจอ" }).click();

  const beforeAdd = await page.locator(".rs-rnd").count();
  await page.getByRole("button", { name: /รูปภาพ เพิ่มภาพประกอบ/ }).dragTo(page.locator(".rs-sheet"), { targetPosition: { x: 300, y: 400 }, force: true });
  assert.equal(await page.locator(".rs-rnd").count(), beforeAdd + 1, "asset must appear after drop");
  const largePng = await sharp(randomFillSync(Buffer.alloc(512 * 512 * 3)), { raw: { width: 512, height: 512, channels: 3 } }).png({ compressionLevel: 0 }).toBuffer();
  assert.ok(largePng.length > 750_000 && largePng.length < 900 * 1024);
  await page.locator("#block-image").setInputFiles({ name: "large.png", mimeType: "image/png", buffer: largePng });
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  await page.reload();
  await page.locator(".rs-panel-tabs").getByRole("button", { name: "เลเยอร์" }).click();
  await page.locator(".rs-layer-name").first().click();
  assert.ok((await page.locator(".rs-rnd img[src^='data:image/png']").first().getAttribute("src"))?.length > 1_000_000);
  const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6SAAAAABJRU5ErkJggg==", "base64");
  await page.locator("#block-image").setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: tinyPng });
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const dropped = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections.at(-1);
  assert.ok(Math.abs(dropped.frame.x - 300) <= 8, `drop x=${dropped.frame.x}`);
  assert.ok(Math.abs(dropped.frame.y - 400) <= 8, `drop y=${dropped.frame.y}`);
  await page.locator(".rs-panel-tabs").getByRole("button", { name: "เพิ่มบล็อก" }).click();
  await page.getByRole("button", { name: /ข้อความอิสระ/ }).click();
  assert.equal(await page.locator(".rs-rnd").count(), beforeAdd + 2);
  await page.locator("#block-body").fill("ข้อความทดสอบ Resume Studio");
  await page.getByRole("button", { name: "ดีไซน์" }).click();
  await page.locator("#block-accent").fill("#be123c");
  await page.locator("#block-background").fill("#fff2bc");
  await page.locator("#block-font-size").fill("20");
  await page.locator("#block-columns").selectOption("2");
  await page.getByRole("button", { name: "ตำแหน่ง" }).click();
  await page.locator("#frame-x").fill("88");
  await page.locator("#frame-y").fill("800");
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const saved = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  const textBlock = saved.sections.at(-1);
  assert.equal(textBlock.content.body, "ข้อความทดสอบ Resume Studio");
  assert.equal(textBlock.accentColor, "#be123c");
  assert.equal(textBlock.backgroundColor, "#fff2bc");
  assert.equal(textBlock.settings.fontSize, 20);
  assert.equal(textBlock.columns, 2);
  assert.equal(textBlock.frame.x, 88);
  assert.equal(textBlock.frame.y, 800);

  await page.getByRole("button", { name: "เนื้อหา" }).click();
  let delayed = false;
  await page.route("**/api/portfolio/me", async route => {
    if (route.request().method() === "PUT" && !delayed) {
      delayed = true;
      await new Promise(resolve => setTimeout(resolve, 900));
    }
    await route.continue();
  });
  await page.locator("#block-body").fill("ระหว่างบันทึก ครั้งที่หนึ่ง");
  await page.waitForTimeout(1250);
  await page.locator("#block-body").fill("ระหว่างบันทึก ข้อความล่าสุด");
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  await page.unroute("**/api/portfolio/me");
  assert.equal((await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections.at(-1).content.body, "ระหว่างบันทึก ข้อความล่าสุด");

  let failed = false;
  await page.route("**/api/portfolio/me", async route => {
    if (route.request().method() === "PUT" && !failed) { failed = true; await route.abort("failed"); }
    else await route.continue();
  });
  await page.locator("#block-body").fill("กู้คืนหลังบันทึกล้มเหลว");
  await page.getByText("บันทึกไม่สำเร็จ", { exact: true }).waitFor({ timeout: 10000 });
  assert.equal(await page.locator("#block-body").inputValue(), "กู้คืนหลังบันทึกล้มเหลว");
  await page.unroute("**/api/portfolio/me");
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  assert.equal((await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections.at(-1).content.body, "กู้คืนหลังบันทึกล้มเหลว");

  await page.locator("#block-image").setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: tinyPng });
  await page.locator("#block-image-position").selectOption("top");
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const withImage = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  assert.ok(withImage.sections.at(-1).content.imageUrl.startsWith("data:image/png;base64,"));
  assert.equal(withImage.sections.at(-1).settings.imagePosition, "top");
  await page.locator("#block-image-position").selectOption("left");
  await page.getByRole("button", { name: "ดีไซน์" }).click();
  await page.locator("#block-columns").selectOption("1");
  await page.locator("#block-font-size").fill("16");
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });

  await page.getByRole("button", { name: "เทมเพลต" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: new URL("./templates-desktop.png", import.meta.url).pathname, fullPage: false });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: new URL("./editor-1280.png", import.meta.url).pathname, fullPage: false });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: /Modern/ }).click();
  const afterTemplate = await page.locator(".rs-rnd").count();
  assert.equal(afterTemplate, beforeAdd + 2);
  assert.equal((await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.templateId, "professional", "template must stay in draft until save");
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await page.getByRole("button", { name: "ทำซ้ำ" }).click();
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const templated = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  assert.equal(templated.templateId, "modern");
  assert.equal(templated.sections.length, saved.sections.length);
  assert.equal(new Set(templated.sections.map(section => section.id)).size, saved.sections.length);
  assert.equal(templated.sections.find(section => section.id === textBlock.id).content.body, "กู้คืนหลังบันทึกล้มเหลว");
  assert.equal(templated.sections.find(section => section.id === textBlock.id).content.imageUrl, withImage.sections.at(-1).content.imageUrl);

  await page.screenshot({ path: new URL("./editor-desktop.png", import.meta.url).pathname, fullPage: false });
  assert.equal(await page.locator(".rs-overflow-alert").count(), 0, "demo document should fit its blocks before PDF");
  await page.getByRole("button", { name: "ดูตัวอย่าง" }).click();
  assert.ok(await page.locator(".rs-preview-overlay").getByText("กู้คืนหลังบันทึกล้มเหลว").count());
  await page.screenshot({ path: new URL("./preview-desktop.png", import.meta.url).pathname, fullPage: false });
  await page.pdf({ path: new URL("./resume-demo.pdf", import.meta.url).pathname, format: "A4", preferCSSPageSize: true, printBackground: true });
  await page.getByRole("button", { name: "ปิดตัวอย่าง" }).click();

  await page.getByRole("button", { name: "เผยแพร่" }).click();
  await page.getByText("เผยแพร่ Resume แล้ว").waitFor({ timeout: 10000 });
  const published = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  assert.equal(published.status, "published");
  const publicPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await publicPage.goto(`${baseURL}/p/${published.slug}`);
  assert.ok(await publicPage.getByText("กู้คืนหลังบันทึกล้มเหลว").count());
  await publicPage.screenshot({ path: new URL("./public-desktop.png", import.meta.url).pathname, fullPage: true });

  await admin.goto(`${baseURL}/admin/preview/${testStudent.id}`);
  assert.ok(await admin.getByText("กู้คืนหลังบันทึกล้มเหลว").count());

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await login(mobile, studentId, studentPassword);
  await mobile.goto(`${baseURL}/student/editor`);
  await mobile.screenshot({ path: new URL("./editor-mobile.png", import.meta.url).pathname, fullPage: false });
  await mobile.getByRole("button", { name: "ปรับแต่ง" }).click();
  assert.equal(await mobile.locator("#resume-title").isVisible(), true);
  await mobile.getByRole("button", { name: "ปิดแผง" }).first().click();
  await mobile.goto(`${baseURL}/p/${published.slug}`);
  await mobile.screenshot({ path: new URL("./public-mobile.png", import.meta.url).pathname, fullPage: false });

  await page.getByRole("button", { name: "เนื้อหา" }).click();
  await page.locator("#block-body").fill("ยังอยู่หลังปิดเผยแพร่");
  await page.getByRole("button", { name: "ปิดเผยแพร่" }).click();
  await page.getByText("ปิดเผยแพร่แล้ว งานที่กำลังแก้ยังอยู่").waitFor({ timeout: 10000 });
  assert.equal(await page.locator("#block-body").inputValue(), "ยังอยู่หลังปิดเผยแพร่");
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const unpublished = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
  assert.equal(unpublished.status, "unpublished");
  assert.equal(unpublished.sections.find(section => section.id === textBlock.id).content.body, "ยังอยู่หลังปิดเผยแพร่");
  assert.equal((await publicPage.goto(`${baseURL}/p/${published.slug}`)).status(), 404);

  const mongo = new MongoClient("mongodb://localhost:27017/resume_studio_test");
  try {
    await mongo.connect();
    const collection = mongo.db("resume_studio_test").collection("portfolios");
    const key = { userId: new ObjectId(testStudent.id) };
    const beforeRead = await collection.findOne(key);
    assert.ok(beforeRead);
    await collection.updateOne(key, { $unset: { layoutVersion: "" } });
    const legacy = await collection.findOne(key);
    const adapted = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio;
    assert.equal(adapted.layoutVersion, 1);
    const afterRead = await collection.findOne(key);
    assert.equal(afterRead.layoutVersion, undefined, "GET must not migrate storage");
    assert.equal(afterRead.updatedAt.getTime(), legacy.updatedAt.getTime());
    const persisted = await page.request.put(`${baseURL}/api/portfolio/me`, { data: adapted });
    assert.equal(persisted.status(), 200);
    assert.equal((await collection.findOne(key)).layoutVersion, 1);
  } finally { await mongo.close(); }

  const countBeforeLayerActions = await page.locator(".rs-rnd").count();
  await page.getByRole("button", { name: "คัดลอกบล็อก" }).click();
  assert.equal(await page.locator(".rs-rnd").count(), countBeforeLayerActions + 1);
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว", { exact: true }).waitFor({ timeout: 10000 });
  const copiedId = (await (await page.request.get(`${baseURL}/api/portfolio/me`)).json()).portfolio.sections.at(-1)?.id;
  await page.locator(".rs-layer").first().getByRole("button", { name: "ซ่อน" }).click();
  assert.equal(await page.locator(".rs-rnd").count(), countBeforeLayerActions);
  await page.locator(".rs-layer").first().getByRole("button", { name: "แสดง" }).click();
  await page.locator(".rs-layer").first().getByRole("button", { name: "ล็อก" }).click();
  assert.equal(await page.getByRole("button", { name: "ลบบล็อก" }).isDisabled(), true);
  await page.locator(".rs-layer").first().getByRole("button", { name: "ปลดล็อก" }).click();
  await page.getByRole("button", { name: "ลบบล็อก" }).click();
  assert.equal(await page.locator(".rs-rnd").count(), countBeforeLayerActions);
  assert.notEqual(copiedId, textBlock.id);

  await page.locator(".rs-layer-name").filter({ hasText: "ข้อความ" }).first().click();
  await page.locator("#block-body").fill("ข้อความยาว ".repeat(900));
  await page.getByText(/มีเนื้อหาล้นใน/).waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  assert.equal(await page.locator("#block-body").inputValue(), "ยังอยู่หลังปิดเผยแพร่");
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log("PASS: login/roles, legacy adapter, drag/resize/zoom, validation, properties, images, save races/retry, templates, history, layers, overflow, preview/PDF, publish/public/admin/mobile/unpublish");
} finally {
  await browser.close();
}
