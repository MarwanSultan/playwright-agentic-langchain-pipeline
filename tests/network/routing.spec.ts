import { expect, test } from '../../fixtures/test';

test.describe('network routing behavior', () => {
  test('captures and fulfills a deterministic API response', async ({ page, homePage }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.method()));

    await page.route('**/api/test-search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: ['benefits'] }),
      });
    });

    const payload = await homePage.page.evaluate(async () => {
      const response = await fetch('/api/test-search');
      return response.json();
    });

    expect(payload).toEqual({ results: ['benefits'] });
    expect(requests).toContain('GET');
  });

  test('aborts a selected request without affecting the homepage fixture', async ({
    page,
    homePage,
  }) => {
    await page.route('**/api/simulated-failure', (route) => route.abort('failed'));

    const result = await homePage.page.evaluate(async () => {
      try {
        await fetch('/api/simulated-failure');
        return 'unexpected-success';
      } catch {
        return 'network-failure';
      }
    });

    expect(result).toBe('network-failure');
  });

  test('continues a document request with an added diagnostic header', async ({
    page,
    runtimeConfig,
  }) => {
    let observedStatus = 0;
    let originalHeader: string | undefined;
    let continuedWithDiagnosticHeader = false;

    page.on('request', (request) => {
      if (request.isNavigationRequest()) {
        originalHeader = request.headers()['x-test-run'];
      }
    });

    page.on('response', (response) => {
      if (response.request().isNavigationRequest()) {
        observedStatus = response.status();
      }
    });

    await page.route(`${runtimeConfig.baseUrl}/`, async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-test-run': 'network-routing',
      };
      continuedWithDiagnosticHeader = headers['x-test-run'] === 'network-routing';

      await route.continue({
        headers,
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(originalHeader).toBeUndefined();
    expect(continuedWithDiagnosticHeader).toBe(true);
    expect(observedStatus).toBeGreaterThanOrEqual(200);
    expect(observedStatus).toBeLessThan(400);
  });

  test('surfaces a deterministic backend error response', async ({ page, homePage }) => {
    await page.route('**/api/simulated-error', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'dependency unavailable' }),
      }),
    );

    const response = await homePage.page.evaluate(async () => {
      const result = await fetch('/api/simulated-error');
      return { status: result.status, body: await result.json() };
    });

    expect(response).toEqual({
      status: 503,
      body: { error: 'dependency unavailable' },
    });
  });

  test('inspects response status and content type for a mocked dependency', async ({
    page,
    homePage,
  }) => {
    await page.route('**/api/simulated-response', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ready' }),
      }),
    );

    const observed = await homePage.page.evaluate(async () => {
      const response = await fetch('/api/simulated-response');
      return {
        status: response.status,
        contentType: response.headers.get('content-type'),
      };
    });

    expect(observed).toEqual({
      status: 200,
      contentType: 'application/json',
    });
  });
});
