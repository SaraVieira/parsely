import { chromium } from "@playwright/test";

const RESULTS = "/Users/saravieira/Projects/parsley/test-results";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // === TEST 1: Bulk Rename ===
  console.log("=== TEST 1: Bulk Rename ===");
  await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
  console.log("Page loaded");

  // Wait for ReactFlow nodes
  await page.waitForSelector(".react-flow__node", { timeout: 30000 });
  console.log("Graph view loaded");
  await page.waitForTimeout(2000);

  // Debug: take a screenshot of current state
  await page.screenshot({ path: `${RESULTS}/00-debug-initial.png` });

  const idKeys = await page.locator('.react-flow__node >> text="id"').all();
  console.log(`Found ${idKeys.length} "id" key elements`);

  if (idKeys.length > 0) {
    await idKeys[0].dblclick();
    await page.waitForTimeout(500);
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("userId");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${RESULTS}/01-bulk-rename-choice-popup.png` });
    console.log("Screenshot: 01-bulk-rename-choice-popup.png");

    const allBtn = page.locator('button:has-text("All")');
    if (await allBtn.isVisible({ timeout: 3000 })) {
      await allBtn.click();
      await page.waitForTimeout(1500);
    }

    await page.screenshot({ path: `${RESULTS}/02-bulk-rename-all-applied.png` });
    console.log("Screenshot: 02-bulk-rename-all-applied.png");
  } else {
    console.log("WARN: No id keys found");
    await page.screenshot({ path: `${RESULTS}/01-debug-graph.png` });
  }

  // === TEST 2: Tree View ===
  console.log("\n=== TEST 2: Tree View ===");

  const jsonInputTab = page.locator('text="JSON Input"').first();
  if (await jsonInputTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await jsonInputTab.click();
    await page.waitForTimeout(500);
  }

  // List buttons for debugging
  const allButtons = await page.locator('button').all();
  console.log(`Total buttons: ${allButtons.length}`);
  for (const btn of allButtons) {
    const al = await btn.getAttribute("aria-label").catch(() => null);
    const ti = await btn.getAttribute("title").catch(() => null);
    const tx = (await btn.textContent().catch(() => "")).trim().substring(0, 40);
    if (al || ti || tx) console.log(`  btn: aria="${al}" title="${ti}" text="${tx}"`);
  }

  let treeBtnFound = false;
  const treeSelectors = [
    'button[aria-label*="ree"]',
    'button[title*="ree"]',
    'button[aria-label*="Tree"]',
    'button[title*="Tree"]',
  ];
  for (const sel of treeSelectors) {
    const b = page.locator(sel).first();
    if (await b.isVisible({ timeout: 500 }).catch(() => false)) {
      await b.click();
      treeBtnFound = true;
      console.log(`Found tree button via: ${sel}`);
      break;
    }
  }

  if (treeBtnFound) {
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${RESULTS}/03-tree-view.png` });
    console.log("Screenshot: 03-tree-view.png");

    const treeClickTargets = [
      '[role="treeitem"]',
      '.tree-node',
      'button:has-text("▶")',
      'button:has-text("▼")',
      '[class*="collapse"]',
      '[class*="expand"]',
    ];
    for (const sel of treeClickTargets) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
        await el.click();
        console.log(`Clicked tree node via: ${sel}`);
        break;
      }
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${RESULTS}/04-tree-view-toggled.png` });
    console.log("Screenshot: 04-tree-view-toggled.png");

    const codeSelectors = [
      'button[aria-label*="ode"]',
      'button[title*="ode"]',
      'button[aria-label*="ditor"]',
    ];
    for (const sel of codeSelectors) {
      const b = page.locator(sel).first();
      if (await b.isVisible({ timeout: 500 }).catch(() => false)) {
        await b.click();
        console.log(`Switched back via: ${sel}`);
        break;
      }
    }
  } else {
    console.log("WARN: Tree button not found");
    await page.screenshot({ path: `${RESULTS}/03-debug-toolbar.png` });
  }

  // === TEST 3: Code Snippets ===
  console.log("\n=== TEST 3: Code Snippets ===");

  const transformTab = page.locator('[role="tab"]:has-text("Transform"), button:has-text("Transform")').first();
  if (await transformTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await transformTab.click();
    await page.waitForTimeout(1000);
    console.log("Clicked Transform tab");
  } else {
    const t2 = page.locator('text="Transform"').first();
    if (await t2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await t2.click();
      await page.waitForTimeout(1000);
    }
  }

  const monacoEditor = page.locator('.monaco-editor').first();
  if (await monacoEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
    await monacoEditor.click();
    await page.waitForTimeout(300);
    await page.keyboard.press("Meta+a");
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(300);
    await page.keyboard.type("_.", { delay: 150 });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: `${RESULTS}/05-code-snippets-autocomplete.png` });
    console.log("Screenshot: 05-code-snippets-autocomplete.png");
  } else {
    console.log("WARN: Monaco editor not found");
    await page.screenshot({ path: `${RESULTS}/05-debug-transform.png` });
  }

  console.log("\n=== Summary ===");
  console.log(errors.length ? `Page errors: ${errors.join("; ")}` : "No page errors.");

  await browser.close();
  console.log("Done!");
})();
