# Test Cases — Cart State Consistency

**Why this flow**: cart is backed by Valkey (Redis-compatible) and holds session state across
multiple independent requests. Confirmed in container logs: every add/view is a separate
`AddItemAsync` / `GetCartAsync` call keyed by `userId`, which is exactly the shape of bug class
(stale reads, lost writes, cross-session bleed) that's invisible in a single manual click-through
and easy to ship.

---

### TC-05: Add same product twice — quantity should accumulate, not duplicate a line

**Preconditions**: Fresh session, empty cart.

**Steps**:
1. Add Product A, quantity 1.
2. Navigate away (e.g., to another product page) and back to the cart.
3. Add Product A again, quantity 2.

**Expected result**: Cart shows **one** line for Product A with quantity 3, not two separate lines.

**Edge cases / risks to flag**:
- This is a classic Redis-backed-cart bug: whether the store treats `(userId, productId)` as a
  unique key with an increment, or naively appends. Confirmed relevant from logs — `AddItemAsync`
  is called independently per add, so the accumulation logic lives entirely server-side and is
  worth a dedicated assertion rather than trusting the UI to render it correctly.

---

### TC-06: Remove item from cart, verify it does not reappear on refresh

**Preconditions**: Cart has 2+ items.

**Steps**:
1. Remove one item from the cart via the UI.
2. Refresh the page.

**Expected result**: Removed item stays removed; remaining item(s) and total reflect the removal
correctly.

**Edge cases / risks to flag**:
- If the cart total is cached client-side and not re-fetched from `GetCartAsync` on refresh, a
  stale total could be displayed briefly or persistently — worth explicitly checking the total
  updates from a fresh server read, not a client-side subtraction.

---

### TC-07: Cart persists across a currency switch mid-session

**Preconditions**: Cart has 1+ item, currency set to USD.

**Steps**:
1. Note the cart contents and USD total.
2. Switch currency to a different value (e.g., EUR or INR).
3. Return to the cart.

**Expected result**: Same items and quantities remain in the cart; only the *displayed* price
changes to reflect the new currency — the underlying cart contents (product IDs, quantities) are
untouched.

**Edge cases / risks to flag**:
- Directly follows from the strategy doc's Tier-1 concern: currency switching must be a pure
  display-layer conversion, not something that mutates stored cart state. If quantities or items
  silently change on a currency switch, that's a serious, hard-to-notice data integrity bug.

---

### TC-08: Two separate sessions (different userIds) do not see each other's cart contents

**Preconditions**: Two separate browser sessions / incognito windows, or two separate `userId`
cookies.

**Steps**:
1. In session A, add Product X to the cart.
2. In session B (different session/cookie), open the cart.

**Expected result**: Session B's cart is empty (or contains only what session B itself added) —
no cross-session leakage of Product X.

**Edge cases / risks to flag**:
- Confirmed from logs that cart operations are keyed by `userId` (a UUID), which is the right
  design — but this test exists specifically to catch a regression where a shared/static key,
  caching bug, or session-cookie misconfiguration could cause cross-user cart bleed. This is a
  security/privacy-adjacent risk, not just a functional one, and deserves explicit coverage even
  though it's unlikely to fail in a demo app — the *pattern* of testing for it matters for a real
  system.

---

*(4 of ~10 total test cases — remaining cases continue in 03-observability-health-signal.md)*
