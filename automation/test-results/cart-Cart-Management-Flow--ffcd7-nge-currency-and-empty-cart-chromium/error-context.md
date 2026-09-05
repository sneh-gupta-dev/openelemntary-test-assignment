# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> Cart Management Flow >> Add multiple items, change currency, and empty cart
- Location: tests\cart.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Total')
Expected: visible
Error: strict mode violation: getByText('Total') resolved to 2 elements:
    1) <label>Total</label> aka locator('label').filter({ hasText: 'Total' })
    2) <h3 class="CartItems-styled__TotalText-sc-d8f9148b-8 gjBizS">Total</h3> aka getByRole('heading', { name: 'Total' })

Call log:
  - Expect "toBeVisible" getByText('Total') with timeout 5000ms
  - waiting for getByText('Total')

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]:
    - banner [ref=f1e3]:
      - navigation [ref=f1e4]:
        - generic [ref=f1e5]:
          - link [ref=f1e6] [cursor=pointer]:
            - /url: /
          - generic [ref=f1e8]:
            - generic [ref=f1e10]:
              - generic [ref=f1e11]: $
              - combobox [ref=f1e12] [cursor=pointer]:
                - option "AUD"
                - option "BGN"
                - option "BRL"
                - option "CAD"
                - option "CHF"
                - option "CNY"
                - option "CZK"
                - option "DKK"
                - option "EUR"
                - option "GBP"
                - option "HKD"
                - option "HRK"
                - option "HUF"
                - option "IDR"
                - option "ILS"
                - option "INR"
                - option "ISK"
                - option "JPY"
                - option "KRW"
                - option "MXN"
                - option "MYR"
                - option "NOK"
                - option "NZD"
                - option "PHP"
                - option "PLN"
                - option "RON"
                - option "RUB"
                - option "SEK"
                - option "SGD"
                - option "THB"
                - option "TRY"
                - option "USD" [selected]
                - option "ZAR"
              - img "arrow" [ref=f1e13]
            - generic [ref=f1e14] [cursor=pointer]:
              - img "Cart icon" [ref=f1e15]
              - generic [ref=f1e16]: "1"
    - main [ref=f1e17]:
      - generic [ref=f1e18]:
        - generic [ref=f1e19]:
          - generic [ref=f1e20]:
            - generic [ref=f1e21]:
              - heading "Shopping Cart" [level=1] [ref=f1e22]
              - button "Empty Cart" [ref=f1e23] [cursor=pointer]
            - generic [ref=f1e24]:
              - generic [ref=f1e25]:
                - generic [ref=f1e26]: Product
                - generic [ref=f1e27]: Quantity
                - generic [ref=f1e28]: Price
                - generic [ref=f1e29]: Total
              - generic [ref=f1e30]:
                - link [ref=f1e31] [cursor=pointer]:
                  - /url: /product/1YMWWN1N4O
                  - generic [ref=f1e32]:
                    - img "Eclipsmart Travel Refractor Telescope" [ref=f1e33]
                    - paragraph [ref=f1e34]: Eclipsmart Travel Refractor Telescope
                - generic [ref=f1e36]:
                  - combobox [ref=f1e37] [cursor=pointer]:
                    - option "1" [selected]
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5"
                    - option "6"
                    - option "7"
                    - option "8"
                    - option "9"
                    - option "10"
                  - img "select" [ref=f1e38]
                - paragraph [ref=f1e41]:
                  - generic [ref=f1e42]: $ 129.95
                - paragraph [ref=f1e45]:
                  - generic [ref=f1e46]: $ 129.95
              - generic [ref=f1e47]:
                - generic [ref=f1e48]: Shipping
                - generic [ref=f1e49]: $ 8.99
              - generic [ref=f1e50]:
                - heading "Total" [level=3] [ref=f1e51]
                - heading "$ 138.94" [level=3] [ref=f1e52]
          - generic [ref=f1e54]:
            - heading "Shipping Address" [level=1] [ref=f1e55]
            - generic [ref=f1e56]:
              - paragraph [ref=f1e57]: E-mail Address
              - textbox [ref=f1e58]: someone@example.com
            - generic [ref=f1e59]:
              - paragraph [ref=f1e60]: Street Address
              - textbox [ref=f1e61]: 1600 Amphitheatre Parkway
            - generic [ref=f1e62]:
              - paragraph [ref=f1e63]: Zip Code
              - textbox [ref=f1e64]: "94043"
            - generic [ref=f1e65]:
              - paragraph [ref=f1e66]: City
              - textbox [ref=f1e67]: Mountain View
            - generic [ref=f1e68]:
              - generic [ref=f1e69]:
                - paragraph [ref=f1e70]: State
                - textbox [ref=f1e71]: CA
              - generic [ref=f1e72]:
                - paragraph [ref=f1e73]: Country
                - textbox "Country Name" [ref=f1e74]: United States
            - heading "Payment Method" [level=1] [ref=f1e76]
            - generic [ref=f1e77]:
              - paragraph [ref=f1e78]: Credit Card Number
              - textbox "0000-0000-0000-0000" [ref=f1e79]: 4432-8015-6152-0454
            - generic [ref=f1e80]:
              - generic [ref=f1e81]:
                - paragraph [ref=f1e82]: Month
                - combobox [ref=f1e83]:
                  - option "January" [selected]
                  - option "February"
                  - option "March"
                  - option "April"
                  - option "May"
                  - option "June"
                  - option "July"
                  - option "August"
                  - option "September"
                  - option "October"
                  - option "November"
                  - option "January"
                - img "arrow" [ref=f1e84]
              - generic [ref=f1e85]:
                - paragraph [ref=f1e86]: Year
                - combobox [ref=f1e87]:
                  - option "2026"
                  - option "2027"
                  - option "2028"
                  - option "2029"
                  - option "2030" [selected]
                  - option "2031"
                  - option "2032"
                  - option "2033"
                  - option "2034"
                  - option "2035"
                  - option "2036"
                  - option "2037"
                  - option "2038"
                  - option "2039"
                  - option "2040"
                  - option "2041"
                  - option "2042"
                  - option "2043"
                  - option "2044"
                  - option "2045"
                - img "arrow" [ref=f1e88]
              - generic [ref=f1e89]:
                - paragraph [ref=f1e90]: CVV
                - textbox [ref=f1e91]: "672"
            - generic [ref=f1e92]:
              - link [ref=f1e93] [cursor=pointer]:
                - /url: /
                - button "Continue Shopping" [ref=f1e94]
              - button "Place Order" [ref=f1e95] [cursor=pointer]
        - generic [ref=f1e96]:
          - heading "You May Also Like" [level=3] [ref=f1e98]
          - generic [ref=f1e99]:
            - link "The Comet Book $ 0.99" [ref=f1e100] [cursor=pointer]:
              - /url: /product/HQTGWGPNH4
              - generic [ref=f1e103]:
                - paragraph [ref=f1e104]: The Comet Book
                - paragraph [ref=f1e105]:
                  - generic [ref=f1e106]: $ 0.99
            - link "Solar Filter $ 69.95" [ref=f1e107] [cursor=pointer]:
              - /url: /product/6E92ZMYYFZ
              - generic [ref=f1e110]:
                - paragraph [ref=f1e111]: Solar Filter
                - paragraph [ref=f1e112]:
                  - generic [ref=f1e113]: $ 69.95
            - link "Roof Binoculars $ 209.95" [ref=f1e114] [cursor=pointer]:
              - /url: /product/2ZYFJ3GM2N
              - generic [ref=f1e117]:
                - paragraph [ref=f1e118]: Roof Binoculars
                - paragraph [ref=f1e119]:
                  - generic [ref=f1e120]: $ 209.95
            - link "National Park Foundation Explorascope $ 101.96" [ref=f1e121] [cursor=pointer]:
              - /url: /product/OLJCESPC7Z
              - generic [ref=f1e124]:
                - paragraph [ref=f1e125]: National Park Foundation Explorascope
                - paragraph [ref=f1e126]:
                  - generic [ref=f1e127]: $ 101.96
    - contentinfo [ref=f1e128]:
      - generic [ref=f1e129]:
        - paragraph [ref=f1e130]: This website is hosted for demo purpose only. It is not an actual shop.
        - paragraph [ref=f1e131]:
          - generic [ref=f1e132]: "session-id: 4b43796c-c05d-43bf-9478-ac0f9b575502"
      - paragraph [ref=f1e133]:
        - text: "@ 2026 OpenTelemetry ("
        - link "Source Code" [ref=f1e134] [cursor=pointer]:
          - /url: https://github.com/open-telemetry/opentelemetry-demo
        - text: )
      - generic [ref=f1e135]: local
  - alert [ref=f1e136]: Otel Demo - Cart
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Cart Management Flow', () => {
  4  |   test('Add multiple items, change currency, and empty cart', async ({ page }) => {
  5  |     // 1. Navigate to landing page
  6  |     await page.goto('/');
  7  | 
  8  |     // 3. Add a second product
  9  |     await page.goto('/');
  10 |     const secondProduct = page.locator('a[href^="/product/"]').nth(1);
  11 |     await secondProduct.click();
  12 |     await page.getByRole('button', { name: 'Add To Cart' }).click();
  13 | 
  14 |     // Verify first item in cart
  15 |     await expect(page).toHaveURL(/.*cart/);
> 16 |     await expect(page.getByText('Total')).toBeVisible();
     |                                           ^ Error: expect(locator).toBeVisible() failed
  17 | 
  18 |     // 3. Add same product again to increase quantity
  19 |     await page.goto('/');
  20 |     await firstProduct.click();
  21 |     await page.getByRole('button', { name: /add to cart/i }).click();
  22 | 
  23 |     // 4. Change Currency (Assuming there's a currency dropdown)
  24 |     // The demo has a currency selector, often in the footer or header
  25 |     const currencySelect = page.locator('select').filter({ hasText: /USD|EUR/i }).first();
  26 |     if (await currencySelect.isVisible()) {
  27 |         await currencySelect.selectOption({ label: 'EUR' });
  28 |         // Give it a moment to fetch the new conversion
  29 |         await page.waitForLoadState('networkidle');
  30 |         // Assert some currency symbol change if possible, here we just verify it doesn't crash
  31 |     }
  32 | 
  33 |     // 5. Empty Cart
  34 |     const emptyCartBtn = page.getByRole('button', { name: /empty cart/i });
  35 |     await emptyCartBtn.click();
  36 | 
  37 |     // Verify cart is empty
  38 |     await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  39 |   });
  40 | });
  41 | 
```