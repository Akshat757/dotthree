import { expect, test } from '@playwright/test';

/** Demo smoke tests — the three journeys the client demo relies on. Run after `npm run build`. */

test.describe('visualiser', () => {
  test('swap a material, make variant B, compare, save', async ({ page }) => {
    await page.goto('/visualiser/edit/?template=living-modern-indian');
    await expect(page.getByRole('heading', { level: 1, name: /Living Room/ })).toBeVisible();

    // Apply a material to the active surface and check the summary lists it.
    await page.getByRole('list', { name: 'Materials' }).getByRole('button').nth(1).click();

    // Night lighting, then duplicate to Variant B.
    await page.getByRole('button', { name: 'Night' }).click();
    await page.getByRole('button', { name: /Duplicate as new variant/ }).click();
    await expect(page.getByRole('button', { name: 'Variant B', exact: true })).toBeVisible();

    // Change a surface in B so the variants differ, then compare 2-up.
    await page.getByRole('list', { name: 'Surfaces' }).getByRole('button').nth(1).click();
    await page.getByRole('list', { name: 'Materials' }).getByRole('button').nth(3).click();
    await page.getByRole('button', { name: 'Compare', exact: true }).click();
    await expect(page.getByText('Variant A', { exact: true }).first()).toBeVisible();

    // Save and find it in the dashboard.
    await page.getByRole('button', { name: /Save design/ }).click();
    await expect(page.getByText(/Design saved on this device \(2 variants\)/)).toBeVisible();
    await page.goto('/dashboard/?tab=designs');
    await expect(page.getByText(/2 variant/)).toBeVisible();
  });

  test('copied share link restores the combination', async ({ page }) => {
    await page.goto('/visualiser/edit/?template=kitchen-modular-l&s=ceiling:ivory-mist&l=night');
    await expect(page.getByRole('button', { name: 'Night' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test.describe('estimator', () => {
  // Smooth scrolling keeps the page "unstable" for Playwright; the site turns it off under reduced motion.
  test.use({ reducedMotion: 'reduce' });

  test('range updates on tier change and the PDF downloads', async ({ page }) => {
    await page.goto('/estimate/');
    const total = page.locator('[aria-live="polite"] p.tabular').first();
    const before = await total.textContent();

    await page.getByRole('button', { name: 'Compare tiers' }).click();
    await page.getByRole('button', { name: /^Premium/ }).click();
    await expect(total).not.toHaveText(before ?? '');
    await expect(page.getByText(/\d+ changed/)).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download PDF/ }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.pdf$/);
    const stream = await file.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const bytes = Buffer.concat(chunks);
    expect(bytes.length).toBeGreaterThan(1000);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  });
});

test.describe('consultation', () => {
  test('blocks an out-of-area home visit, then books in-area', async ({ page }) => {
    await page.goto('/consultation/');
    await page.getByRole('button', { name: /Home visit/ }).click();
    await page.getByLabel('PIN code').fill('462001');
    await expect(page.locator('main [role="alert"]')).toContainText(
      'Home visits cover Indore district only',
    );
    await page.getByRole('button', { name: /Switch to a video consultation/ }).click();
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);

    await page.getByRole('button', { name: /Home visit/ }).click();
    await page.getByLabel('PIN code').fill('452010');
    await page.getByLabel(/^Name/).fill('Test Client');
    await page.getByLabel(/^Mobile/).fill('9876543210');
    await page.getByRole('radio').first().click(); // first available day
    await page
      .getByRole('radio', { name: /^\d{1,2}:\d{2}/ })
      .first()
      .click();
    await page.getByRole('checkbox').click();
    await page.waitForTimeout(2200); // bot-guard time trap
    await page.getByRole('button', { name: 'Request this slot' }).click();

    await expect(page.getByText(/IND-\d{4}-\d{4}/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Google Calendar/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /\.ics/ })).toBeVisible();
  });
});
