# QA Take-Home — OpenTelemetry Astronomy Shop

## Approach, in short

I ran the app locally first rather than reasoning about risk from the architecture description
alone. That surfaced a real, reproducible finding — `astronomy-db` logs a `FATAL: role "root" does
not exist` every 5 seconds, in lockstep with its own healthcheck, while Docker reports the service
as `healthy` the entire time (root cause: `pg_isready` runs as the container's default `root` OS
user with no `-U` flag). That finding shaped a good chunk of this submission: it's referenced in the
test strategy's risk analysis, has its own dedicated test cases and automation, and anchors the
answer to REFLECTION.md's first question. I'd rather ship fewer, evidenced findings than a longer
list of hypothetical ones.

I picked **CI failure triage** for the agentic section (over test generation or self-healing)
because it let me build ground-truth examples from this repo's actual output rather than inventing
generic scenarios from scratch.

## What's in here

| Path | What it is |
|---|---|
| `test-strategy.md` | Risk prioritization, test pyramid, QA ownership, CI gates, metrics |
| `test-cases/` | 10 detailed manual test cases across 3 highest-risk flows |
| `automation/` | Working Playwright (checkout/cart) + pytest (health-signal) automation, with a README covering setup and honest coverage accounting |
| `automation-strategy.md` | Tooling rationale, team structure, CI triggers, flakiness/test-data handling |
| `agentic/` | CI-triage agent design, eval rubric, input fixtures, and the exported CLI agent transcript |
| `REFLECTION.md` | Escalation priorities, ownership structure, week-1 vs month-3 roadmap |

## Setup — running the app

```bash
git clone --depth=1 https://github.com/open-telemetry/opentelemetry-demo
cd opentelemetry-demo
docker compose up
```

Frontend at `http://localhost:8080`. All images are pre-built; no local build step needed.

## Setup — running the automation

See `automation/README.md` for full details. Short version, once the app above is running:

```bash
# UI flows (checkout, cart)
cd automation
npm install && npx playwright install --with-deps chromium
npx playwright test

# Health signal integrity
cd automation/observability
pip install -r requirements.txt --break-system-packages
pytest test_health_signal_integrity.py -v
```

## Setup — the agentic section

`agentic/AGENT-DESIGN.md` and `agentic/eval/rubric.md` cover the design and eval approach.
`agentic/README.md` has the exact steps to reproduce the CLI agent session against this repo, if
you want to re-run it yourself rather than just reading the included transcript
(`agentic/TRANSCRIPT.jsonl`).
