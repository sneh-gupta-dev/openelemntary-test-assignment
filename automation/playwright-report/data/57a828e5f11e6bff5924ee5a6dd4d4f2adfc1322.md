# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout Flow >> Complete purchase of items successfully
- Location: tests\checkout.spec.ts:4:7

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
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - navigation [ref=e4]:
        - generic [ref=e5]:
          - link [ref=e6] [cursor=pointer]:
            - /url: /
          - generic [ref=e8]:
            - generic [ref=e10]:
              - generic [ref=e11]: $
              - combobox [ref=e12] [cursor=pointer]:
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
              - img "arrow" [ref=e13]
            - generic [ref=e14] [cursor=pointer]:
              - img "Cart icon" [ref=e15]
              - generic [ref=e16]: "1"
    - main [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]:
              - heading "Shopping Cart" [level=1] [ref=e22]
              - button "Empty Cart" [ref=e23] [cursor=pointer]
            - generic [ref=e24]:
              - generic [ref=e25]:
                - generic [ref=e26]: Product
                - generic [ref=e27]: Quantity
                - generic [ref=e28]: Price
                - generic [ref=e29]: Total
              - generic [ref=e30]:
                - link [ref=e31] [cursor=pointer]:
                  - /url: /product/0PUK6V6EV0
                  - generic [ref=e32]:
                    - img "Solar System Color Imager" [ref=e33]
                    - paragraph [ref=e34]: Solar System Color Imager
                - generic [ref=e36]:
                  - combobox [ref=e37] [cursor=pointer]:
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
                  - img "select" [ref=e38]
                - paragraph [ref=e41]:
                  - generic [ref=e42]: $ 175.00
                - paragraph [ref=e45]:
                  - generic [ref=e46]: $ 175.00
              - generic [ref=e47]:
                - generic [ref=e48]: Shipping
                - generic [ref=e49]: $ 8.99
              - generic [ref=e50]:
                - heading "Total" [level=3] [ref=e51]
                - heading "$ 183.99" [level=3] [ref=e52]
          - generic [ref=e54]:
            - heading "Shipping Address" [level=1] [ref=e55]
            - generic [ref=e56]:
              - paragraph [ref=e57]: E-mail Address
              - textbox [ref=e58]: someone@example.com
            - generic [ref=e59]:
              - paragraph [ref=e60]: Street Address
              - textbox [ref=e61]: 1600 Amphitheatre Parkway
            - generic [ref=e62]:
              - paragraph [ref=e63]: Zip Code
              - textbox [ref=e64]: "94043"
            - generic [ref=e65]:
              - paragraph [ref=e66]: City
              - textbox [ref=e67]: Mountain View
            - generic [ref=e68]:
              - generic [ref=e69]:
                - paragraph [ref=e70]: State
                - textbox [ref=e71]: CA
              - generic [ref=e72]:
                - paragraph [ref=e73]: Country
                - textbox "Country Name" [ref=e74]: United States
            - heading "Payment Method" [level=1] [ref=e76]
            - generic [ref=e77]:
              - paragraph [ref=e78]: Credit Card Number
              - textbox "0000-0000-0000-0000" [ref=e79]: 4432-8015-6152-0454
            - generic [ref=e80]:
              - generic [ref=e81]:
                - paragraph [ref=e82]: Month
                - combobox [ref=e83]:
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
                - img "arrow" [ref=e84]
              - generic [ref=e85]:
                - paragraph [ref=e86]: Year
                - combobox [ref=e87]:
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
                - img "arrow" [ref=e88]
              - generic [ref=e89]:
                - paragraph [ref=e90]: CVV
                - textbox [ref=e91]: "672"
            - generic [ref=e92]:
              - link [ref=e93] [cursor=pointer]:
                - /url: /
                - button "Continue Shopping" [ref=e94]
              - button "Place Order" [ref=e95] [cursor=pointer]
        - generic [ref=e96]:
          - heading "You May Also Like" [level=3] [ref=e98]
          - generic [ref=e99]:
            - link "National Park Foundation Explorascope $ 101.96" [ref=e100] [cursor=pointer]:
              - /url: /product/OLJCESPC7Z
              - generic [ref=e103]:
                - paragraph [ref=e104]: National Park Foundation Explorascope
                - paragraph [ref=e105]:
                  - generic [ref=e106]: $ 101.96
            - link "Solar Filter $ 69.95" [ref=e107] [cursor=pointer]:
              - /url: /product/6E92ZMYYFZ
              - generic [ref=e110]:
                - paragraph [ref=e111]: Solar Filter
                - paragraph [ref=e112]:
                  - generic [ref=e113]: $ 69.95
            - link "Starsense Explorer Refractor Telescope $ 349.95" [ref=e114] [cursor=pointer]:
              - /url: /product/66VCHSJNUP
              - generic [ref=e117]:
                - paragraph [ref=e118]: Starsense Explorer Refractor Telescope
                - paragraph [ref=e119]:
                  - generic [ref=e120]: $ 349.95
            - link "The Comet Book $ 0.99" [ref=e121] [cursor=pointer]:
              - /url: /product/HQTGWGPNH4
              - generic [ref=e124]:
                - paragraph [ref=e125]: The Comet Book
                - paragraph [ref=e126]:
                  - generic [ref=e127]: $ 0.99
    - contentinfo [ref=e128]:
      - generic [ref=e129]:
        - paragraph [ref=e130]: This website is hosted for demo purpose only. It is not an actual shop.
        - paragraph [ref=e131]:
          - generic [ref=e132]: "session-id: 72ce4447-22aa-4af7-9314-567d8fc6b127"
      - paragraph [ref=e133]:
        - text: "@ 2026 OpenTelemetry ("
        - link "Source Code" [ref=e134] [cursor=pointer]:
          - /url: https://github.com/open-telemetry/opentelemetry-demo
        - text: )
      - generic [ref=e135]: local
  - alert [ref=e136]: Otel Demo - Cart
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Checkout Flow', () => {
  4  |   test('Complete purchase of items successfully', async ({ page }) => {
  5  |     // 1. Navigate to landing page
  6  |     await page.goto('/');
  7  | 
  8  |     // 2. Add an item to the cart
  9  |     const productCard = page.locator('a[href^="/product/"]').first();
  10 |     await productCard.click();
  11 |     
  12 |     const addToCartBtn = page.getByRole('button', { name: 'Add To Cart' });
  13 |     await addToCartBtn.click();
  14 | 
  15 |     // 3. Verify item is in cart
  16 |     await expect(page).toHaveURL(/.*cart/);
> 17 |     await expect(page.getByText('Total')).toBeVisible();
     |                                           ^ Error: expect(locator).toBeVisible() failed
  18 | 
  19 |     // 4. Fill in shipping information
  20 |     await page.locator('#email').fill('test@example.com');
  21 |     await page.locator('#street_address').fill('123 QA Street');
  22 |     await page.locator('#city').fill('Testville');
  23 |     await page.locator('#state').fill('CA');
  24 |     await page.locator('#zip_code').fill('90210');
  25 |     await page.locator('#country').fill('USA');
  26 | 
  27 |     // 5. Fill in credit card details
  28 |     const ccInput = page.locator('#credit_card_number');
  29 |     if (await ccInput.isVisible()) {
  30 |         await ccInput.fill('4111111111111111');
  31 |         await page.locator('#credit_card_expiration_month').selectOption('12');
  32 |         await page.locator('#credit_card_expiration_year').selectOption('2025');
  33 |         await page.locator('#credit_card_cvv').fill('123');
  34 |     }
  35 | 
  36 |     // 6. Complete Checkout
  37 |     const completeCheckoutBtn = page.getByRole('button', { name: 'Place Order' });
  38 |     await completeCheckoutBtn.click();
  39 | 
  40 |     // 8. Verify order confirmation
  41 |     await expect(page.getByText(/order confirmation|thank you/i)).toBeVisible();
  42 |     await expect(page.getByText(/order id/i)).toBeVisible();
  43 |   });
  44 | });
  45 | 
```