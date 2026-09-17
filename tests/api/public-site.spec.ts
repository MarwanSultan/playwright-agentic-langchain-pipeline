import { expect } from '@playwright/test';

import { apiTest as test } from '../../fixtures/api';

test.describe('public site HTTP contract', () => {
  test('supports a safe read-only homepage request', async ({ publicSite }) => {
    const response = await publicSite.get('/');

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toMatch(/text\/html/i);
    expect(await response.text()).toContain('<html');
  });

  test('exposes the public robots policy', async ({ publicSite }) => {
    const response = await publicSite.get('/robots.txt');

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toMatch(/text\/(plain|html)/i);
    expect(await response.text()).toMatch(/user-agent/i);
  });

  test('exposes the public sitemap document', async ({ publicSite }) => {
    const response = await publicSite.get('/sitemap.xml');

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toMatch(/xml/i);
    expect(await response.text()).toContain('<');
  });

  test('rejects API paths that are not rooted', async ({ publicSite }) => {
    await expect(publicSite.get('not-a-rooted-path')).rejects.toThrow(
      /API paths must start with '\/'/,
    );
  });

  test('returns an HTML content type for the homepage contract', async ({ publicSite }) => {
    const response = await publicSite.get('/');

    expect(response.headers()['content-type']).toMatch(/^text\/html/i);
    expect(
      response.headers()['content-length'] ?? response.headers()['transfer-encoding'],
    ).toBeTruthy();
  });
});
