#!/usr/bin/env python3
"""Report storage duplicates and the deduped ingest queue."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ingest_core import ingested_file_names, list_pending_files, storage_duplicate_skip_names
from supabase_client import create_service_client


def main() -> int:
    supabase = create_service_client()
    rpc = supabase.rpc("list_storage_files", {"p_bucket": "Documents", "p_prefix": ""}).execute()
    storage_paths = [
        r["file_path"]
        for r in (rpc.data or [])
        if not str(r["file_path"]).endswith(".emptyFolderPlaceholder")
    ]
    storage_names = {p.split("/")[-1] for p in storage_paths}

    ingested = ingested_file_names(supabase)

    skip = storage_duplicate_skip_names(storage_names, ingested)
    pending_deduped = list_pending_files(supabase, "Documents", dedupe=True)
    pending_raw = list_pending_files(supabase, "Documents", dedupe=False)

    report = {
        "storage_total": len(storage_names),
        "already_ingested": len(ingested),
        "duplicate_files_to_skip": sorted(skip),
        "duplicate_skip_count": len(skip),
        "pending_without_dedupe": len(pending_raw),
        "pending_with_dedupe": len(pending_deduped),
        "ingest_queue": [p.split("/")[-1] for p in pending_deduped],
    }
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
