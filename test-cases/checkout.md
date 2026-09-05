# Test Case: End-to-End Checkout Flow

## Meta
- **Flow:** Complete purchase of items
- **Risk Level:** CRITICAL
- **Why this flow is high risk:** The checkout process is the primary revenue driver. It integrates the frontend, cart, checkout, payment, shipping, email, and currency services. A failure in any of these synchronous or asynchronous boundaries leads to a failed transaction and lost revenue.

## Preconditions
1. The user is on the frontend landing page.
2. The user has at least one item available in the product catalog.
3. The cart is currently empty.

## Steps & Expected Results

| Step # | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Navigate to a product page and click "Add to Cart". | Item is added to the cart. User is redirected to the Cart page. The cart displays the correct item, quantity (1), and total price. |
| 2 | Click the "Place Order" button. | User is navigated to the Checkout page. |
| 3 | Enter valid shipping information (Email, Address, City, State, Zip). | Input fields accept the data without validation errors. |
| 4 | Enter valid credit card details (Card Number, Expiration, CVV). | Input fields accept the data. |
| 5 | Click the "Complete Checkout" (or equivalent) button to submit the order. | 1. Order is processed successfully.<br>2. User is redirected to an Order Confirmation page with an Order ID.<br>3. The cart is empty if navigated back.<br>4. (Backend validation) An email dispatch event is registered in the Email service logs/metrics. |

## Edge Cases & Negative Scenarios
- **Insufficient Funds / Declined Card:** The payment service rejects the card. The UI should display a user-friendly error message, and the cart should *not* be cleared.
- **Service Timeout:** If the shipping service takes too long to calculate rates, the checkout service should handle the timeout gracefully, either failing the order predictably or using a fallback flat rate.
- **Currency Mismatch:** If the user changes currency mid-checkout, the final charge passed to the payment gateway must accurately reflect the selected currency and converted amount.

## Quality Risk Flags (Ship Blocker)
If any of the following occur during manual testing, the release should be blocked:
- Payment is successful but the order confirmation fails (resulting in a charge without an order record).
- The cart fails to clear after a successful purchase, allowing the user to duplicate the order accidentally.
- Traces in Jaeger/Zipkin are broken across the checkout boundary, violating observability requirements.
