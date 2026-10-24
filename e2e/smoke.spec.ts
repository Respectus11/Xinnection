import { test, expect } from '@playwright/test';

test.describe('Xinnection Application Smoke Tests', () => {
  test('landing page loads with key branding and reflection elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Xinnection').first()).toBeVisible();
    await expect(page.locator('text=WE GET YOU.')).toBeVisible();
    await expect(page.locator('text=100% Anonymous & Encrypted')).toBeVisible();

    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    const responderLogin = page.locator('text=Responder Login');
    await expect(responderLogin).toBeVisible();
  });

  test('navigation to auth portal renders login form fields', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('seeker code view renders access token and action controls', async ({ page }) => {
    await page.goto('/code?c=TEST-CODE-1234');

    await expect(page.locator('text=TEST-CODE-1234')).toBeVisible();
  });
});
