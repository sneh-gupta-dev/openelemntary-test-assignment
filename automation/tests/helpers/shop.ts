import { Page, expect } from '@playwright/test';

/**
 * Thin helper layer over the storefront UI. Kept deliberately simple (no full page-object
 * framework) since the surface under test is small and a heavier abstraction would add
 * maintenance cost without buying much for a suite this size.
 */

export async function addFirstProductToCart(page: Page, quantity = 1) {
  await page.goto('/');
  // The demo's product grid links to /product/<id>; take the first one deterministically.
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await firstProduct.click();

  if (quantity > 1) {
    const qtySelect = page.locator('select[name="quantity"], [data-cy="product-quantity"]');
    if (await qtySelect.count()) {
      await qtySelect.selectOption(String(quantity));
    }
  }

  await page.getByRole('button', { name: /add to cart/i }).click();
}

export async function goToCart(page: Page) {
  await page.goto('/cart');
}

export async function setCurrency(page: Page, currencyCode: string) {
  // The currency selector is a native <select> in the header in the upstream demo.
  const selector = page.locator('select').filter({ hasText: /USD|EUR|INR|GBP|JPY/ }).first();
  await selector.selectOption(currencyCode);
  // Give the app a moment to re-fetch converted prices.
  await page.waitForLoadState('networkidle');
}

export async function completeCheckout(page: Page, overrides: Partial<CheckoutForm> = {}) {
  const form: CheckoutForm = {
    email: 'qa-automation@example.com',
    streetAddress: '1600 Amphitheatre Parkway',
    zipCode: '94043',
    city: 'Mountain View',
    state: 'CA',
    country: 'United States',
    creditCardNumber: '4432801561520454',
    creditCardExpirationMonth: '1',
    creditCardExpirationYear: '2030',
    creditCardCvv: '672',
    ...overrides,
  };

  await goToCart(page);
  await page.getByRole('button', { name: /place order|proceed to checkout/i }).click();

  // Fill fields defensively by name attribute — matches the upstream demo's checkout form.
  for (const [field, value] of Object.entries(form)) {
    const input = page.locator(`[name="${field}"]`);
    if (await input.count()) {
      await input.fill(String(value));
    }
  }

  await page.getByRole('button', { name: /place order/i }).click();
}

interface CheckoutForm {
  email: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  creditCardNumber: string;
  creditCardExpirationMonth: string;
  creditCardExpirationYear: string;
  creditCardCvv: string;
}

export async function expectOrderConfirmed(page: Page) {
  await expect(page.getByText(/order is complete/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/order id/i)).toBeVisible();
}
