import { expect, test } from '../../fixtures/test';

test.describe('VA.gov homepage', () => {
  test('loads the configured homepage through the fixture', async ({ homePage, runtimeConfig }) => {
    await expect(homePage.page).toHaveURL(
      (url) => url.origin === new URL(runtimeConfig.baseUrl).origin,
    );
    await expect(homePage.page).toHaveTitle(/VA|Veterans Affairs/i);
  });

  test('exposes the site header landmark', async ({ homePage }) => {
    await expect(homePage.siteHeader).toBeVisible();
  });

  test('renders a visible primary heading', async ({ homePage }) => {
    await expect(homePage.headings.first()).toBeVisible();
  });

  test('exposes the main content landmark', async ({ homePage }) => {
    await expect(homePage.mainContent).toBeVisible();
  });

  test('provides navigable links in the site header', async ({ homePage }) => {
    await expect(homePage.siteHeader.getByRole('link').first()).toBeVisible();
  });
});
