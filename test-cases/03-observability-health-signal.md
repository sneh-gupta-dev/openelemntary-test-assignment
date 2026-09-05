# Test Cases — Observability & Health Signal Integrity

**Why this flow**: not a user-facing flow, but a real, evidenced risk. Confirmed via
`docker inspect` and `docker compose logs`: `astronomy-db` emits a `FATAL: role "root" does not
exist` log line every 5 seconds, in lockstep with its own healthcheck interval, while
`docker inspect --format '{{json .State.Health}}'` reports `"Status":"healthy"` the entire time.
Root cause: the healthcheck runs `pg_isready` as the container's default OS user (`root`), which
Postgres logs as an auth failure, even though `pg_isready` doesn't require successful auth to
report the server as reachable. Functionally harmless — but it manufactures a continuous stream of
FATAL-level noise. This test class exists because a green checkout (TC-01) is not sufficient
evidence of system health, and this is a concrete, reproducible example of exactly that gap.

---

### TC-09: Health status accurately reflects actual service state

**Preconditions**: Full stack running via `docker compose up`.

**Steps**:
1. Run `docker inspect astronomy-db --format '{{json .State.Health}}'`.
2. Run `docker compose logs --tail=50 astronomy-db`.
3. Compare the two: does the reported health status agree with what the logs show is actually
   happening?

**Expected result**: In a well-configured system, a `healthy` status and a log stream with
per-request FATAL entries should not coexist without explanation. Either the healthcheck should
authenticate correctly (no FATAL lines), or FATAL-level severity should not be used for a condition
the system considers acceptable.

**Actual observed result (this run)**: `Status: healthy`, `FailingStreak: 0`, but `FATAL` logged
every 5 seconds indefinitely. This is a **fail** against the expected result above — flagged as a
quality risk, not a functional bug, but the exact kind of thing that erodes trust in production
alerting over time.

**What I'd flag before shipping**: this specific case is cosmetic (`pg_isready` doesn't need the
`-U` flag it's implicitly missing to be fixed), but the pattern is not — anywhere a healthcheck or
low-severity condition logs at FATAL/ERROR severity, it should either be fixed to not error, or
downgraded to a severity that doesn't trigger alerting. I would not ship a service with unexplained
FATAL-severity log noise without a ticket to resolve or an explicit decision to suppress it in
log-based alerting rules.

---

### TC-10: A genuine FATAL-level failure remains detectable amid known noise

**Preconditions**: Same environment, with the known `astronomy-db` FATAL noise present.

**Steps**:
1. Deliberately introduce a second, distinct failure condition (for example: stop the `payment`
   service mid-session, or point a service at an invalid downstream address).
2. Attempt a checkout that depends on the now-broken service.
3. Search the aggregated logs (or whatever log pipeline exists) for FATAL/ERROR entries.

**Expected result**: The genuine new failure should be identifiable as distinct from the known
`astronomy-db` noise — e.g., by service name, error message, or a dashboard that filters known-noisy
signals — without a human having to manually eyeball a scrolling log stream to tell them apart.

**Edge cases / risks to flag**: this is the actual point of TC-09 and TC-10 together — noise doesn't
just look bad, it actively degrades the ability to detect real incidents. If the answer to "can you
tell these apart quickly" is no, that's the escalation-worthy finding, not the astronomy-db line
item itself.

---

*(10 of 10 test cases total across the three flows — see test-strategy.md §1 and §5 for how these
tie back to risk prioritization and the metrics I'd track in production.)*
