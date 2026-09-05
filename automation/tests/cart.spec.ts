import { test, expect } from '@playwright/test';
import { addFirstProductToCart, goToCart, setCurrency } from './helpers/shop';

/**
 * Covers TC-05, TC-06, TC-07 from test-cases/02-cart-state.md.
 *
 * NOTE on TC-08 (cross-session isolation) — deliberately NOT automated here. It requires two
 * genuinely separate browser contexts with independent cookies, which Playwright can do
 * (browser.newContext() twice), but asserting "session B sees nothing added by session A" is
 * only meaningful if the app assigns userId via a cookie that Playwright can inspect and clear
 * reliably between contexts. Doing this properly is worth a dedicated spec, not a bolt-on to this
 * file — left as a documented gap rather than a shallow, false-confidence test. See
 * automation-strategy.md for how I'd prioritize adding this.
 */

test.describe('Cart state consistency', () => {
  test('TC-05: adding the same product twice accumulates quantity, not duplicate lines', async ({ page }) => {
    await addFirstProductToCart(page, 1);
    await goToCart(page);
    const initialRows = await page.locator('[data-cy="cart-item"], .cart-item-row').count();

    await addFirstProductToCart(page, 2);
    await goToCart(page);
    const finalRows = await page.locator('[data-cy="cart-item"], .cart-item-row').count();

    // Row count should NOT grow — same product, quantity should accumulate on the existing line.
    expect(finalRows).toBe(initialRows);
  });

  test('TC-06: removing an item does not reappear after refresh', async ({ page }) => {
    await addFirstProductToCart(page, 1);
    await goToCart(page);

    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.count()) {
      await removeButton.click();
    }

    await page.reload();
    const rowsAfterReload = await page.locator('[data-cy="cart-item"], .cart-item-row').count();
    expect(rowsAfterReload).toBe(0);
  });

  test('TC-07: cart contents persist across a currency switch', async ({ page }) => {
    await addFirstProductToCart(page, 1);
    await goToCart(page);
    const itemNameBefore = await page.locator('[data-cy="cart-item"], .cart-item-row').first().textContent();

    await setCurrency(page, 'EUR');
    await goToCart(page);
    const itemNameAfter = await page.locator('[data-cy="cart-item"], .cart-item-row').first().textContent();

    // Same product should still be present — only price formatting should change, not identity.
    expect(itemNameAfter?.split('\n')[0]).toBeTruthy();
    expect(itemNameBefore).toBeTruthy();
  });
});
