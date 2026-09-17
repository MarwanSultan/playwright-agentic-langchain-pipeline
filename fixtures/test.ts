import { test as base, type Page } from '@playwright/test';

import { getRuntimeConfig, type RuntimeConfig } from '../config/environment';
import { HomePage } from '../pages/home.page';

export type FrameworkFixtures = {
  homePage: HomePage;
  irsPage: Page;
  runtimeConfig: RuntimeConfig;
};

export const test = base.extend<FrameworkFixtures>({
  runtimeConfig: async ({ page: _page }, use) => {
    await use(getRuntimeConfig());
  },

  homePage: async ({ page }, use) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (!response || response.status() >= 400) {
      throw new Error(`Homepage navigation failed with status ${response?.status() ?? 'unknown'}`);
    }

    await use(new HomePage(page));
  },

  irsPage: async ({ browser, runtimeConfig }, use) => {
    const context = await browser.newContext({ baseURL: runtimeConfig.irsBaseUrl });
    const page = await context.newPage();
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    if (!response || response.status() >= 400) {
      await context.close();
      throw new Error(`IRS.gov navigation failed with status ${response?.status() ?? 'unknown'}`);
    }

    try {
      await use(page);
    } finally {
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
