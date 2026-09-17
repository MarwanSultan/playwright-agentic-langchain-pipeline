import { expect, test } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', () => {
    // Keep the generator seed executable until a generated scenario replaces it.
    expect(true).toBe(true);
  });
});
