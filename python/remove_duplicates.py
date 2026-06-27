#!/usr/bin/env python3
"""Remove duplicate storage files and their document_chunks rows."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ingest_core import ingested_file_names, storage_duplicate_skip_names
from supabase_client import create_service_client

BUCKET = "Documents"


def chunk_count(supabase, file_name: str) -> int:
    resp = (
        supabase.table("document_chunks")
        .select("id", count="exact")
        .eq("file_name", file_name)
        .execute()
    )
    return resp.count or 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Delete duplicate files + chunks")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be deleted without making changes",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    supabase = create_service_client()

    rpc = supabase.rpc("list_storage_files", {"p_bucket": BUCKET, "p_prefix": ""}).execute()
    storage_paths = [
        r["file_path"]
        for r in (rpc.data or [])
        if not str(r["file_path"]).endswith(".emptyFolderPlaceholder")
    ]
    storage_names = {p.split("/")[-1] for p in storage_paths}
    ingested = ingested_file_names(supabase)

    to_delete = sorted(storage_duplicate_skip_names(storage_names, ingested))

    plan: list[dict] = []
    total_chunks = 0
    for name in to_delete:
        chunks = chunk_count(supabase, name)
        total_chunks += chunks
        plan.append({"file": name, "chunks": chunks, "in_storage": name in storage_names})

    summary = {
        "dry_run": args.dry_run,
        "files_to_delete": len(to_delete),
        "chunks_to_delete": total_chunks,
        "plan": plan,
    }

    if args.dry_run:
        print(json.dumps(summary, indent=2))
        return 0

    deleted_files: list[str] = []
    deleted_chunks = 0
    errors: list[dict] = []

    for entry in plan:
        name = entry["file"]
        try:
            if entry["chunks"]:
                supabase.table("document_chunks").delete().eq("file_name", name).execute()
                deleted_chunks += entry["chunks"]
            if entry["in_storage"]:
                supabase.storage.from_(BUCKET).remove([name])
            deleted_files.append(name)
        except Exception as exc:  # noqa: BLE001
            errors.append({"file": name, "error": str(exc)})

    result = {
        "deleted_files": len(deleted_files),
        "deleted_chunks": deleted_chunks,
        "errors": errors,
    }
    print(json.dumps(result, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
