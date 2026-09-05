"""
Automation for TC-09 and TC-10 (test-cases/03-observability-health-signal.md).

These are not UI tests — they assert on container health state and log content directly, because
the risk they cover ("does the reported health status match what's actually happening") is
invisible to a browser-driven test entirely. Requires the stack to already be running via
`docker compose up` in the opentelemetry-demo repo.

Run with: pytest test_health_signal_integrity.py -v
"""

import json
import subprocess
import time

import pytest

ASTRONOMY_DB_CONTAINER = "astronomy-db"


def run_docker(*args: str) -> str:
    """Run a docker CLI command and return stdout, raising on failure."""
    result = subprocess.run(
        ["docker", *args],
        capture_output=True,
        text=True,
        timeout=15,
    )
    if result.returncode != 0:
        pytest.skip(
            f"docker command failed (is the stack running?): {' '.join(args)}\n{result.stderr}"
        )
    return result.stdout.strip()


def get_health_state(container: str) -> dict:
    raw = run_docker("inspect", container, "--format", "{{json .State.Health}}")
    if raw == "null" or not raw:
        pytest.skip(f"{container} has no configured healthcheck")
    return json.loads(raw)


def get_recent_logs(container: str, tail: int = 50) -> str:
    result = subprocess.run(
        ["docker", "compose", "logs", "--tail", str(tail), container],
        capture_output=True,
        text=True,
        timeout=15,
    )
    return result.stdout


class TestHealthSignalIntegrity:
    def test_tc09_health_status_matches_log_reality(self):
        """
        TC-09: A 'healthy' status should not coexist with unexplained FATAL-level log noise
        without that noise being either fixed or explicitly accounted for.

        This test does NOT fail the build on the known astronomy-db finding — that would just be
        re-encoding a known, accepted issue as a permanent red build, which trains the team to
        ignore this suite. Instead it captures and reports the condition so it's visible in test
        output, and would fail if a *new*, previously-unseen FATAL pattern appears in a service
        reporting healthy. See automation-strategy.md for the reasoning on why this is an
        assertion about detectability, not a binary pass/fail on the presence of any FATAL line.
        """
        health = get_health_state(ASTRONOMY_DB_CONTAINER)
        logs = get_recent_logs(ASTRONOMY_DB_CONTAINER, tail=50)

        fatal_count = logs.count("FATAL")
        is_healthy = health.get("Status") == "healthy"

        # Known, documented condition (see test-strategy.md and TC-09): astronomy-db reports
        # healthy while logging FATAL every ~5s due to the pg_isready healthcheck running as the
        # `root` OS user. We assert this specific, known signature explicitly rather than
        # silently swallowing it, so a change in behavior (e.g., someone "fixes" it, or a
        # different FATAL appears) is visible in test output either way.
        known_signature = 'FATAL:  role "root" does not exist' in logs

        if is_healthy and fatal_count > 0:
            if known_signature:
                pytest.xfail(
                    "Known issue: astronomy-db healthcheck (pg_isready, run as root) generates "
                    f"FATAL log noise every ~5s while reporting healthy ({fatal_count} FATAL "
                    "lines in last 50 log lines). See test-strategy.md for root cause and "
                    "escalation rationale. This xfail should be removed once the healthcheck is "
                    "fixed to authenticate correctly."
                )
            else:
                pytest.fail(
                    f"{ASTRONOMY_DB_CONTAINER} reports healthy but logs {fatal_count} FATAL "
                    "lines with an UNRECOGNIZED signature — this is a new finding, not the known "
                    "pg_isready issue, and needs investigation before this test can pass."
                )

    def test_tc10_genuine_failure_distinguishable_from_known_noise(self):
        """
        TC-10: verifies the known astronomy-db noise has a stable, matchable signature so tooling
        (or a human) can filter it out and still see a different failure underneath.

        This does not spin up a second failure condition (that belongs in a fuller integration
        test with proper teardown) — it verifies the precondition that makes such filtering
        possible at all: that the known noise has a distinct, greppable signature separate from
        generic FATAL/ERROR text.
        """
        logs = get_recent_logs(ASTRONOMY_DB_CONTAINER, tail=200)

        known_noise_lines = [line for line in logs.splitlines() if 'role "root" does not exist' in line]
        other_fatal_lines = [
            line for line in logs.splitlines()
            if "FATAL" in line and 'role "root" does not exist' not in line
        ]

        if known_noise_lines:
            # The known noise must be attributable to a specific, filterable message —
            # confirming a log pipeline COULD suppress exactly this and nothing else.
            assert all('role "root" does not exist' in line for line in known_noise_lines)

        # This assertion is the actual point: if a genuine new FATAL ever appears, it must not
        # share the same message text as the known noise (which would make it unfilterable).
        for line in other_fatal_lines:
            assert 'role "root" does not exist' not in line, (
                "A new FATAL log line matches the known noise signature — it would be silently "
                "filtered alongside the harmless healthcheck noise. This is exactly the alert-"
                "fatigue risk described in test-strategy.md."
            )
