# Automation Strategy

## Why these tools

**Playwright over Selenium/Cypress for the UI suite**: auto-waiting removes most of the flakiness
that comes from manual `sleep()`/polling in a system this asynchronous (cart operations,
recommendation fan-out, currency conversion all happen behind the scenes before the UI settles).
Built-in trace/screenshot-on-failure means a failing CI run is debuggable without re-running it
locally first — important once this isn't just me looking at it. TypeScript over plain JS for the
same reason I'd want it in application code: the checkout form helper (`completeCheckout`) takes a
typed object, so a typo in a field name is a compile error, not a silent no-op three months from
now when someone forgets which fields exist.

**Python + pytest, separately, for the observability suite**: this suite shells out to `docker` and
parses log text — there's no browser involved, and no reason to force it through a browser-testing
framework. `pytest.xfail` specifically (over just asserting and accepting a red build) was chosen
because it's a built-in mechanism for tracking a known, non-blocking issue without either hiding it
or letting it permanently mask other regressions in the same file.

**What I didn't reach for**: a full page-object-model framework, or a BDD layer (Cucumber/Gherkin).
Ten test cases across two flows doesn't justify the maintenance overhead of either — `helpers/shop.ts`
is a thin, honest abstraction that can grow into a page-object structure later if the suite grows
past ~30-40 cases. Introducing that structure now would be optimizing for a team size and suite size
that doesn't exist yet.

## Structuring this for a team of 4, not just this assignment

- **One shared `automation/` repo, owned collectively, not per-person.** With 4 people and 20
  services, per-person ownership of test files creates the same problem the strategy doc calls out
  for service ownership: cross-cutting flows (checkout) don't have a natural single owner. Ownership
  is by **suite**, not by person — whoever touches checkout-adjacent code updates
  `checkout.spec.ts`, full stop, regardless of who "owns" it.
- **A rotating "automation health" role, one week at a time.** That person's job during their week
  is triaging any CI failures in the shared suite (see below), fixing genuinely flaky tests, and
  keeping the `xfail`/skip list honest — i.e., making sure nothing sits there stale for months. This
  directly feeds the "regression stability" metric from the test strategy doc.
- **New test cases require a linked risk justification, not just a linked ticket.** Given the
  volume of services, the fastest way to end up with a slow, low-value suite is accepting any test
  anyone wants to add. A one-line "why does this matter" in the PR description, mapped back to a
  risk tier, keeps the suite aligned with test-strategy.md instead of drifting into coverage theater.

## Where tests run in CI, and on what triggers

- **On every PR touching `frontend`, `cart`, `checkout`, `payment`, `shipping`, or `currency`**: run
  the Playwright suite against a docker-compose environment spun up in the CI runner. Budgeted to
  stay under ~5 minutes for this suite's current size; if it grows past that, the answer is
  parallelizing across CI shards, not skipping tests.
- **On every PR touching any service's Dockerfile, healthcheck config, or logging setup**: run the
  observability suite. This is a narrower trigger than "every PR" deliberately — most application
  code changes have nothing to do with what TC-09/TC-10 check.
- **On merge to main**: run both suites together, plus a smoke check against the deployed staging
  environment.
- **Nightly**: full suite re-run with no code changes, specifically to catch environmental flakiness
  (a test that passes on the PR that introduced it but fails intermittently afterward is a
  different bug class than a test that never passed).

I would **not** gate every PR on the observability suite by default — it's valuable but narrow, and
running `docker inspect`/log-parsing checks on unrelated PRs (e.g., a copy change in the frontend)
adds CI time without proportional signal.

## Handling flakiness

- **A test fails twice in a row on the same PR before it's treated as a real signal** — the
  `retries: 1` setting in `playwright.config.ts` already encodes this, but retries are a mitigation,
  not a fix. Any test that needs its retry more than occasionally goes on a "known flaky" list with
  an owner and a deadline, not silently tolerated forever.
- **Flaky tests are quarantined, not deleted.** Move them to a separate CI job that reports but
  doesn't block, with a ticket and an owner. A deleted test is a silent coverage loss; a quarantined
  one is a visible, tracked debt.
- **Root-cause flakiness before adding waits.** Playwright's auto-waiting removes most timing bugs
  by design — if a test is still flaky, the more likely cause is a real race condition in the
  app (e.g., cart total rendering before `GetCartAsync` resolves), which is itself a finding worth
  raising, not just papering over with a longer timeout.

## Test data

- **No shared, mutable fixture data.** Each test creates its own session (fresh Playwright browser
  context) and adds its own products, rather than relying on a pre-seeded cart or account that
  other tests might also mutate. This is why `cart.spec.ts` and `checkout.spec.ts` are not
  `fullyParallel` — cart/session state within a single test file is deliberately serial, since these
  specific tests build on cart state incrementally within a test.
- **Test card numbers use documented test values** (e.g., the `4432801561520454` pattern used in
  `helpers/shop.ts`), never anything resembling a real card — this is a demo payment service with no
  real charge behind it, but the habit matters for when the same patterns get reused against a real
  payment gateway's sandbox mode.
- **The observability suite reads live container state and never mutates it** — TC-09/TC-10
  deliberately stop short of actually killing a service to simulate a second failure (see the
  docstring in `observability/test_health_signal_integrity.py`), because a test that leaves the
  environment in a broken state for the next test to inherit is its own flakiness source.
