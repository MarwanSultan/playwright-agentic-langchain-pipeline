import { expect, test } from '../../fixtures/test';

test.describe('IRS.gov navigation', () => {
  test('navigates to the configured IRS.gov homepage through the fixture', async ({
    irsPage,
    runtimeConfig,
  }) => {
    await expect(irsPage).toHaveURL(
      (url) => url.origin === new URL(runtimeConfig.irsBaseUrl).origin,
    );
    await expect(irsPage).toHaveTitle(/Internal Revenue Service|IRS/i);
  });
});
