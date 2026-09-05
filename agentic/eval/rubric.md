# Eval Rubric — CI Triage Agent

The agent receives a CI failure (log + test name + diff, when available) and must output a
structured classification. This rubric defines what "correct" means and how it's checked.

## Required output shape

```json
{
  "classification": "flaky_test | product_bug | environment_issue | test_gap",
  "confidence": "high | medium | low",
  "reasoning": "short explanation citing specific evidence from the input",
  "recommended_action": "what a human should do next",
  "escalate_to_human": true | false
}
```

## Classification definitions (what the agent is actually deciding)

- **flaky_test**: the test's own assertion or timing logic is unreliable — the system under test is
  fine, the test isn't. Evidence pattern: passed on recent history, failure doesn't correlate with a
  code change, environment shows resource contention.
- **product_bug**: the system under test is genuinely behaving incorrectly. Evidence pattern: a
  code diff to application logic correlates with the failure, and the failure represents a real
  violation of expected behavior (not a test artifact).
- **environment_issue**: the test and the application logic are both fine — CI infrastructure,
  configuration, or naming mismatches are the cause. Evidence pattern: failure traces to
  infra/config changes (docker-compose, CI YAML, environment variables), not application code.
- **test_gap**: the test itself is wrong, outdated, or asserting something no longer true for a
  legitimate reason (e.g., an intentional behavior change wasn't reflected in the test). Not
  represented in the three example inputs below on purpose — worth noting as a case the eval set
  should grow to cover.

## Per-example correctness (ground truth, established by me before running the agent)

| Input | Correct classification | Key evidence the agent MUST cite |
|---|---|---|
| `failure-01-flaky-timing.json` | `flaky_test` | Passed 14 prior runs; no code diff; CI load noted; re-run passed |
| `failure-02-product-bug.json` | `product_bug` | Diff directly changes currency rounding logic; failure is a real total mismatch |
| `failure-03-environment-issue.json` | `environment_issue` | Diff renames the docker-compose service; test hardcodes old name; no actual health problem |

## What "correct" means, precisely

1. **Classification matches ground truth** for at least 2 of 3 examples on first pass. (Not 3/3 —
   see "What stops it from generating nonsense" below for why a small, deliberately-not-perfect bar
   is more honest than claiming perfection off 3 examples.)
2. **Reasoning must cite specific evidence from the input**, not generic boilerplate. A reasoning
   string that would apply equally to any of the three inputs is an automatic fail on that example,
   regardless of whether the classification happened to be right — a right answer for the wrong
   reason isn't trustworthy at scale.
3. **`escalate_to_human` must be `true` for `product_bug`** (someone needs to decide whether to
   revert or fix forward) **and for any `confidence: low` result**, regardless of classification.
   The agent should never silently auto-resolve something it's unsure about.

## What stops it from generating nonsense

- **Grounding requirement**: the agent's prompt (see `AGENT-DESIGN.md`) requires it to quote the
  specific line(s) from the log or diff that support its classification. An ungrounded
  classification — one that doesn't quote anything from the actual input — is rejected by the eval
  regardless of whether the label happens to be correct.
- **Structured output only**: free-text explanations without the required JSON shape are treated as
  failures, not partial credit. This is a triage tool meant to feed a dashboard or a Slack message,
  not a chat transcript a human has to re-read and reinterpret.
- **Three examples is a smoke test, not a validation suite.** I'm explicit that this doesn't prove
  the agent generalizes — see AGENT-DESIGN.md's "what stays with a human" section for why every
  `product_bug` classification requires human sign-off regardless of the agent's confidence.
