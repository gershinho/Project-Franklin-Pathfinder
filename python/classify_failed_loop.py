#!/usr/bin/env python3
"""
Loop classify-failed edge function until all chunks have classified_at set.

Use after batch_ingest.py --skip-classify, or to retry chunks that failed
classification during ingest.

  python classify_failed_loop.py
  python classify_failed_loop.py --limit 25 --sleep 5
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))

from supabase_client import ingest_secret, supabase_url


def classify_failed_url() -> str:
    return f"{supabase_url()}/functions/v1/classify-failed"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Loop classify-failed until done")
    parser.add_argument("--limit", type=int, default=25, help="Chunks per edge call (default: 25)")
    parser.add_argument("--sleep", type=float, default=3.0, help="Seconds between calls")
    parser.add_argument("--max-iterations", type=int, default=10_000, help="Safety cap")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    headers = {
        "Content-Type": "application/json",
        "x-ingest-secret": ingest_secret(),
    }

    for iteration in range(1, args.max_iterations + 1):
        print(f"--- classify iteration {iteration} ---")
        res = requests.post(
            classify_failed_url(),
            headers=headers,
            json={"limit": args.limit},
            timeout=600,
        )
        if not res.ok:
            print(f"classify-failed HTTP {res.status_code}: {res.text[:500]}")
            return 1

        body = res.json()
        print(json.dumps(body, indent=2))

        if body.get("done"):
            print("All chunks classified.")
            return 0

        time.sleep(max(args.sleep, 0))

    print("Stopped: hit --max-iterations")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
