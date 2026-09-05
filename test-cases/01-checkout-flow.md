# Test Cases — Checkout Flow (with currency conversion)

**Why this flow**: widest fan-out in the system (cart → shipping → currency → payment → email →
order confirmation), synchronous from the user's perspective, and directly handles money. Confirmed
via manual walkthrough: a completed order shows item price, shipping, and total independently
converted to the selected display currency (observed: INR).

---

### TC-01: Successful checkout, single item, default currency (USD)

**Preconditions**: Fresh session, empty cart, currency selector set to USD.

**Steps**:
1. Browse to any product detail page.
2. Add 1 unit to cart.
3. Go to cart, click "Place Order" / proceed to checkout.
4. Fill in shipping address with valid US address.
5. Fill in payment details with a valid test card.
6. Submit order.

**Expected result**: Order confirmation page shown with a generated Order ID (UUID format),
confirmation message, shipping address echoed back correctly, order item(s) listed with correct
name/quantity/price, and a total that equals `sum(item prices) + shipping cost`.

**Edge cases / risks to flag**:
- Displayed total must exactly equal the sum of displayed line items — rounding drift here is a
  trust-eroding bug class, not a crash.
- Confirm the cart is emptied after successful order (observed in logs: `EmptyCartAsync` fires on
  successful checkout — verify this is reflected in the UI, not just backend state).

---

### TC-02: Successful checkout with currency switched to INR

**Preconditions**: Fresh session, empty cart.

**Steps**:
1. Add 1 item to cart while currency is set to USD.
2. Switch currency selector to INR.
3. Proceed to checkout and complete the order.

**Expected result**: All displayed prices (item, shipping, total) are shown in INR, and the total
still equals the sum of the converted line items. The underlying transaction record (payment
service) should still process a coherent currency code — verify there's no mismatch between what
the payment service charges and what the UI displayed.

**Edge cases / risks to flag**:
- Currency switched *after* items are already in the cart — does the cart's stored/display price
  update correctly, or does it retain a stale USD-computed value?
- Rounding at the currency-conversion boundary (e.g., converting cents can produce values that don't
  sum cleanly) — this is the single highest-value assertion in this whole test suite given what we
  observed in a real order (₹12295.98 + ₹631.66 = ₹12927.64, which summed correctly, but this needs
  regression coverage, not one-time manual confirmation).

---

### TC-03: Checkout with multiple items, mixed quantities

**Preconditions**: Fresh session, empty cart.

**Steps**:
1. Add 3 different products to cart, with quantities 1, 2, and 5 respectively.
2. Proceed to checkout and complete the order.

**Expected result**: Order Items section lists all 3 products with correct quantities and
per-line pricing (unit price × quantity), and total reconciles correctly across all lines plus
shipping.

**Edge cases / risks to flag**:
- Shipping cost calculation — does it change based on item count/weight, or is it flat? If it should
  vary and doesn't, that's a shipping-service bug; if it's meant to be flat, this test should assert
  that explicitly rather than assume.

---

### TC-04: Checkout attempted with invalid/incomplete payment details

**Preconditions**: Fresh session, cart has at least 1 item.

**Steps**:
1. Proceed to checkout.
2. Enter a malformed card number (e.g., too few digits, or a known-invalid test card if the demo
   supports Stripe-style test cards).
3. Submit.

**Expected result**: Order is **not** placed. A clear validation error is shown to the user. No
order confirmation is generated, no email is sent, and the cart is **not** emptied.

**Edge cases / risks to flag**:
- This is the test that directly guards against the failure mode called out in the strategy doc:
  partial success (e.g., payment attempted, cart emptied, but confirmation/email never fires). If the
  system fails here, it should fail *loudly and completely*, not partially. Verify this by checking
  the `payment` and `email` service logs after a deliberately failed submission — the absence of a
  "Transaction complete" / "Order confirmation email sent" log line is the pass condition, not just
  the UI error message.

---

*(4 of ~10 total test cases — remaining cases continue in 02-cart-state.md and
03-observability-health-signal.md)*
