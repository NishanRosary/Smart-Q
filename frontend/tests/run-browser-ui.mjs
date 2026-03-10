import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

const frontendDir = process.cwd();
const apiBaseUrl = "http://localhost:5000/api";
const appUrl = pathToFileURL(path.join(frontendDir, "dist", "index.html")).href;

const mockEvents = [];

const createEventRecord = (payload) => ({
  ...payload,
  _id: `event-${mockEvents.length + 1}`,
  id: `event-${mockEvents.length + 1}`,
  status: "Upcoming",
  availableTokens: Number(payload.totalTokens || 0),
  joinedTokens: 0,
  activeQueueCount: 0,
  isFull: false
});

const run = async () => {
  let browser;

  try {
    const distIndex = path.join(frontendDir, "dist", "index.html");
    await access(distIndex);

    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.route(`${apiBaseUrl}/**`, async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();

      if (url.endsWith("/auth/admin/login") && method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            accessToken: "playwright-admin-token",
            user: {
              id: "admin-1",
              name: "Admin User",
              role: "admin",
              isActive: true
            }
          })
        });
        return;
      }

      if (url.endsWith("/queue") && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([])
        });
        return;
      }

      if (url.endsWith("/predictions") && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ peakTimes: [] })
        });
        return;
      }

      if (url.endsWith("/events") && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockEvents)
        });
        return;
      }

      if (url.endsWith("/events") && method === "POST") {
        const payload = JSON.parse(request.postData() || "{}");
        const createdEvent = createEventRecord(payload);
        mockEvents.push(createdEvent);

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(createdEvent)
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({})
      });
    });

    await page.goto(appUrl, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Admin" }).click();
    await page.waitForSelector("text=Admin Portal");

    await page.locator('input[name="email"]').fill("admin@example.com");
    await page.locator('input[name="password"]').fill("AdminPass123!");
    await page.getByRole("button", { name: "Authenticate" }).click();

    await page.waitForSelector("text=Dashboard Overview");
    await page.getByRole("button", { name: /Schedule New Event/i }).click();
    await page.waitForSelector("text=Event Scheduler");

    await page.locator("#organizationType").selectOption("Hospital");
    await page.locator("#title").fill("General Checkup Camp");
    await page.locator("#organizationName").fill("City General Hospital");
    await page.locator("#totalTokens").fill("10");
    await page.locator("#doctorName").fill("Dr. Kumar");
    await page.locator("#profession").fill("General Medicine");
    await page.locator("#startDate").fill("2030-05-01");
    await page.locator("#endDate").fill("2030-05-01");
    await page.locator("#startTime").fill("09:00");
    await page.locator("#endTime").fill("17:00");
    await page.locator("#location").fill("Main Block");
    await page.locator("#serviceTypes").fill("General Consultation");
    await page.getByRole("button", { name: "Add Service" }).click();

    await page.getByRole("button", { name: "Save Event" }).click();

    await page.waitForSelector("text=Event scheduled successfully!");
    await page.waitForSelector("text=General Checkup Camp");
    await page.waitForSelector("text=City General Hospital");

    const pageText = await page.textContent("body");
    assert.match(pageText || "", /Scheduled Events/);
    assert.match(pageText || "", /General Checkup Camp/);
    assert.match(pageText || "", /City General Hospital/);

    console.log("PASS browser UI happy path for admin login and event scheduler");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

run().catch((error) => {
  console.error("FAIL browser UI test");
  console.error(error);
  process.exit(1);
});
