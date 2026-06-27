#!/usr/bin/env python3
"""
Local batch ingest — mirrors the batch-ingest Supabase edge function.

No 150s edge timeout: run until all files are processed.

Examples:
  # Ingest everything not yet in document_chunks (one file per pass, loop until done)
  python batch_ingest.py

  # Faster first pass: embed only, classify later with classify_failed_loop.py
  python batch_ingest.py --skip-classify --embed-delay-ms 3000

  # Process up to 5 files then stop
  python batch_ingest.py --limit 5 --no-loop

  # Specific files only
  python batch_ingest.py --files "Resume.pdf" "Notes.docx"
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# Allow running as `python batch_ingest.py` from the python/ directory.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from ingest_core import ProcessOpts, list_pending_files, process_file
from supabase_client import create_service_client


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Local batch document ingest for Supabase")
    parser.add_argument("--bucket", default="Documents", help="Storage bucket (default: Documents)")
    parser.add_argument("--folder", default="", help="Optional folder prefix inside the bucket")
    parser.add_argument("--limit", type=int, default=1, help="Max files per iteration (default: 1)")
    parser.add_argument("--skip-classify", action="store_true", help="Embed/chunk only; classify later")
    parser.add_argument("--embed-delay-ms", type=int, default=0, help="Pause between Voyage embed batches")
    parser.add_argument("--embed-batch", type=int, default=8, help="Texts per Voyage request (default: 8)")
    parser.add_argument("--files", nargs="*", help="Only process these file names (basename match)")
    parser.add_argument(
        "--loop",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Keep running until no files remain (default: on)",
    )
    parser.add_argument(
        "--sleep-between",
        type=float,
        default=2.0,
        help="Seconds to wait between files/iterations (default: 2)",
    )
    parser.add_argument(
        "--dedupe",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Skip (1) copies and known rename duplicates (default: on)",
    )
    return parser.parse_args()


def run_once(args: argparse.Namespace) -> dict:
    supabase = create_service_client()
    opts = ProcessOpts(
        skip_classify=args.skip_classify,
        embed_delay_ms=args.embed_delay_ms,
        embed_batch=args.embed_batch,
    )

    pending = list_pending_files(
        supabase,
        bucket=args.bucket,
        folder=args.folder,
        only_files=args.files or None,
        dedupe=args.dedupe,
    )
    print(f"Found {len(pending)} file(s) to process")

    batch = pending[: max(args.limit, 0)]
    processed: list[dict] = []
    skipped: list[dict] = []

    for file_path in batch:
        file_name = file_path.split("/")[-1]
        print(f"Processing: {file_path}")
        try:
            result = process_file(supabase, args.bucket, file_path, opts)
            entry = {
                "file": file_name,
                "chunks": result.chunks,
                "classification": {
                    "ok": result.ok,
                    "flagged": result.flagged,
                    "error": result.error,
                },
            }
            processed.append(entry)
            print(
                f"  done — {result.chunks} chunks "
                f"(ok:{result.ok} flagged:{result.flagged} error:{result.error})"
            )
        except Exception as exc:  # noqa: BLE001 — continue batch like edge function
            msg = str(exc)
            print(f"  failed — {msg}")
            skipped.append({"file": file_name, "reason": msg})

        if args.sleep_between > 0:
            time.sleep(args.sleep_between)

    remaining = len(pending) - len(batch)
    summary = {
        "processed": processed,
        "skipped": skipped,
        "remaining": remaining,
        "done": remaining == 0,
    }
    print(json.dumps(summary, indent=2))
    return summary


def main() -> int:
    args = parse_args()
    iteration = 0

    while True:
        iteration += 1
        if args.loop and iteration > 1:
            print(f"\n--- iteration {iteration} ---")

        summary = run_once(args)
        if summary["done"] or not args.loop:
            return 0 if not summary["skipped"] else 1

        if summary["remaining"] == 0 and not summary["processed"]:
            return 0

        time.sleep(max(args.sleep_between, 0))


if __name__ == "__main__":
    raise SystemExit(main())
