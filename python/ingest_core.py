"""Core ingest pipeline — local port of the batch-ingest Supabase edge function."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import requests
from supabase import Client

from extract_text import SUPPORTED, extract_text
from supabase_client import ingest_secret, supabase_url, voyage_api_key

VOYAGE_API = "https://api.voyageai.com/v1/embeddings"
VOYAGE_MODEL = "voyage-3"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50
EMBED_BATCH = 8


def classify_url() -> str:
    return f"{supabase_url()}/functions/v1/classify-chunk"


@dataclass
class Chunk:
    text: str
    index: int


@dataclass
class ClassifyOutcome:
    framework_refs: list[str] | None
    classification: str  # ok | flagged | error
    reason: str | None = None


@dataclass
class ProcessResult:
    chunks: int
    ok: int
    flagged: int
    error: int


@dataclass
class ProcessOpts:
    skip_classify: bool = False
    embed_delay_ms: int = 0
    embed_batch: int = EMBED_BATCH


def split_into_chunks(text: str, chunk_tokens: int, overlap_tokens: int) -> list[Chunk]:
    char_chunk = chunk_tokens * 4
    char_overlap = overlap_tokens * 4
    step = char_chunk - char_overlap
    paragraphs = [p for p in text.split("\n\n") if len(p.strip()) > 30]

    chunks: list[Chunk] = []
    buf = ""
    idx = 0

    for para in paragraphs:
        candidate = f"{buf}\n\n{para}" if buf else para
        if len(candidate) > char_chunk:
            if buf.strip():
                chunks.append(Chunk(text=buf.strip(), index=idx))
                idx += 1
                buf = buf[max(0, len(buf) - char_overlap) :] + "\n\n" + para
            else:
                for pos in range(0, len(para), step):
                    piece = para[pos : pos + char_chunk].strip()
                    if piece:
                        chunks.append(Chunk(text=piece, index=idx))
                        idx += 1
                buf = ""
        else:
            buf = candidate

    if buf.strip():
        remainder = buf.strip()
        if len(remainder) > char_chunk:
            for pos in range(0, len(remainder), step):
                piece = remainder[pos : pos + char_chunk].strip()
                if piece:
                    chunks.append(Chunk(text=piece, index=idx))
                    idx += 1
        else:
            chunks.append(Chunk(text=remainder, index=idx))

    return chunks


def embed_with_retry(texts: list[str]) -> list[list[float]]:
    delay = 20_000
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {voyage_api_key()}",
    }
    payload = {"model": VOYAGE_MODEL, "input": texts, "input_type": "document"}

    for attempt in range(5):
        res = requests.post(VOYAGE_API, headers=headers, json=payload, timeout=120)
        if res.status_code == 429:
            if attempt == 4:
                raise RuntimeError("Voyage 429: max retries exceeded")
            wait_s = delay / 1000
            print(f"  Voyage 429 — waiting {wait_s:.0f}s (attempt {attempt + 1}/4)")
            time.sleep(wait_s)
            delay *= 2
            continue
        if not res.ok:
            raise RuntimeError(f"Voyage {res.status_code}: {res.text[:500]}")
        data = res.json()["data"]
        data.sort(key=lambda row: row["index"])
        return [row["embedding"] for row in data]

    raise RuntimeError("embed_with_retry: exhausted")


def classify_file(chunks: list[Chunk]) -> dict[int, ClassifyOutcome]:
    outcomes: dict[int, ClassifyOutcome] = {
        c.index: ClassifyOutcome(None, "error", "not_processed") for c in chunks
    }
    try:
        res = requests.post(
            classify_url(),
            headers={
                "Content-Type": "application/json",
                "x-ingest-secret": ingest_secret(),
            },
            json={"chunks": [{"id": c.index, "content": c.text} for c in chunks]},
            timeout=600,
        )
        if not res.ok:
            reason = f"http_{res.status_code}"
            print(f"  classify-chunk HTTP {res.status_code}: {res.text[:200]}")
            for c in chunks:
                outcomes[c.index] = ClassifyOutcome(None, "error", reason)
            return outcomes

        body = res.json()
        for row in body.get("results") or []:
            chunk_id = int(row["id"])
            if row.get("status") == "ok" and row.get("framework_refs"):
                outcomes[chunk_id] = ClassifyOutcome(row["framework_refs"], "ok")
            else:
                outcomes[chunk_id] = ClassifyOutcome(
                    None, "flagged", row.get("reason")
                )
        return outcomes
    except Exception as exc:  # noqa: BLE001 — mirror edge function: never abort ingest
        msg = str(exc)
        print(f"  classify-chunk call failed: {msg}")
        for c in chunks:
            outcomes[c.index] = ClassifyOutcome(None, "error", msg)
        return outcomes


def process_file(
    supabase: Client,
    bucket: str,
    file_path: str,
    opts: ProcessOpts | None = None,
) -> ProcessResult:
    opts = opts or ProcessOpts()
    file_name = file_path.split("/")[-1]
    ext = (file_name.rsplit(".", 1)[-1] if "." in file_name else "").lower()
    embed_batch = opts.embed_batch

    if ext not in SUPPORTED:
        raise ValueError(f"Unsupported file type: .{ext}")

    blob = supabase.storage.from_(bucket).download(file_path)
    buffer = blob if isinstance(blob, bytes) else bytes(blob)

    text = extract_text(buffer, ext)
    if not text.strip():
        raise RuntimeError("No text extracted")

    chunks = split_into_chunks(text, CHUNK_SIZE, CHUNK_OVERLAP)
    print(f"  {len(chunks)} chunks — {file_name}")

    embeddings: list[list[float]] = []
    for i in range(0, len(chunks), embed_batch):
        batch = chunks[i : i + embed_batch]
        embeddings.extend(embed_with_retry([c.text for c in batch]))
        if opts.embed_delay_ms and i + embed_batch < len(chunks):
            print(f"  pacing {opts.embed_delay_ms}ms before next embed batch")
            time.sleep(opts.embed_delay_ms / 1000)

    if opts.skip_classify:
        class_map = {
            c.index: ClassifyOutcome(None, "error", "skip_classify") for c in chunks
        }
    else:
        class_map = classify_file(chunks)

    now = datetime.now(timezone.utc).isoformat()
    ok = flagged = error = 0
    saved = 0

    for i in range(0, len(chunks), embed_batch):
        batch = chunks[i : i + embed_batch]
        rows: list[dict[str, Any]] = []
        for chunk in batch:
            outcome = class_map[chunk.index]
            if outcome.classification == "ok":
                ok += 1
            elif outcome.classification == "flagged":
                flagged += 1
            else:
                error += 1

            metadata: dict[str, Any] = {
                "bucket": bucket,
                "ext": ext,
                "auto_ingested": True,
                "classification": outcome.classification,
            }
            if outcome.reason:
                metadata["classification_reason"] = outcome.reason

            rows.append(
                {
                    "source_id": f"{bucket}/{file_path}",
                    "file_name": file_name,
                    "chunk_index": chunk.index,
                    "content": chunk.text,
                    "embedding": embeddings[chunk.index],
                    "framework_refs": outcome.framework_refs,
                    "classified_at": now if outcome.classification == "ok" else None,
                    "metadata": metadata,
                }
            )

        result = (
            supabase.table("document_chunks")
            .upsert(rows, on_conflict="source_id,chunk_index")
            .execute()
        )
        if getattr(result, "error", None):
            raise RuntimeError(f"Upsert failed: {result.error}")
        saved += len(rows)

    return ProcessResult(chunks=saved, ok=ok, flagged=flagged, error=error)


COPY_SUFFIX_RE = re.compile(r"^(.+) \(\d+\)(\.[^.]+)$")

# Same document uploaded under two naming conventions (verified same byte size in storage).
SEMANTIC_DUPLICATE_PAIRS: list[tuple[str, str]] = [
    ("Ascent ACC _ Session 1 Summary.docx", "KGSB _ Ascent Session 1 (ACC_MIS).Summary.docx"),
    ("Ascent ECON+FIN+RE _ Session 1 Summary.docx", "KGSB _ Ascent Session 1 (ECON + FIN + RE).Summary.docx"),
    ("Ascent MKTNG _ Session 1 Summary.docx", "KGSB _ Ascent Session 1 (MKTNG).Summary.docx"),
    ("Ascent ACC _ Session 1 Transcript.docx", "KGSB-Ascent-Session-1-ACC-MIS.Transcript.docx"),
    ("Ascent ECON+FIN+RE _ Session 1 Transcript.docx", "KGSB-Ascent-Session-1-ECON-FIN-RE.Transcript.docx"),
    ("Ascent MKTNG _ Session 1 Transcript.docx", "KGSB-Ascent-Session-1-MKTNG.Transcript.docx"),
    (
        "KGSB Ascent Lab HR _ Session 4 Transcript.docx",
        "KGSB_Ascent_Lab_HR_Session_4_Transcript_Part1-2.docx",
    ),
    (
        "KGSB Ascent Lab HR _ Session 4 Transcript.docx",
        "KGSB_Ascent_Lab_HR_Session_4_Transcript_Part2-2.docx",
    ),
]


def _canonical_copy_name(name: str) -> str | None:
    m = COPY_SUFFIX_RE.match(name)
    if not m:
        return None
    return m.group(1) + m.group(2)


def storage_duplicate_skip_names(
    storage_names: set[str],
    ingested_names: set[str],
) -> set[str]:
    """Return storage basenames to skip so we never double-ingest the same content."""
    skip: set[str] = set()

    for name in storage_names:
        original = _canonical_copy_name(name)
        if not original or original not in storage_names:
            continue
        if original in ingested_names:
            skip.add(name)
        elif name in ingested_names:
            skip.add(original)
        else:
            skip.add(name)  # neither ingested: keep original only

    for left, right in SEMANTIC_DUPLICATE_PAIRS:
        if left not in storage_names or right not in storage_names:
            continue
        if left in ingested_names:
            skip.add(right)
        elif right in ingested_names:
            skip.add(left)
        else:
            skip.add(right)  # prefer left (Ascent / KGSB-Ascent naming)

    return skip


def ingested_file_names(supabase: Client) -> set[str]:
    """All distinct file_name values in document_chunks (paginated)."""
    names: set[str] = set()
    page_size = 1000
    offset = 0
    while True:
        resp = (
            supabase.table("document_chunks")
            .select("file_name")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        rows = resp.data or []
        if not rows:
            break
        names.update(row["file_name"] for row in rows)
        if len(rows) < page_size:
            break
        offset += page_size
    return names


def list_pending_files(
    supabase: Client,
    bucket: str,
    folder: str = "",
    only_files: list[str] | None = None,
    dedupe: bool = True,
) -> list[str]:
    rpc = supabase.rpc("list_storage_files", {"p_bucket": bucket, "p_prefix": folder}).execute()
    if rpc.data is None:
        raise RuntimeError(f"list_storage_files failed: {getattr(rpc, 'error', 'unknown')}")

    all_paths = [
        row["file_path"]
        for row in rpc.data
        if not str(row["file_path"]).endswith(".emptyFolderPlaceholder")
    ]

    if only_files:
        want = set(only_files)
        all_paths = [p for p in all_paths if p.split("/")[-1] in want]

    if not all_paths:
        return []

    ingested_all = ingested_file_names(supabase)

    pending = [p for p in all_paths if p.split("/")[-1] not in ingested_all]
    if not dedupe:
        return pending

    storage_names = {p.split("/")[-1] for p in all_paths}
    skip = storage_duplicate_skip_names(storage_names, ingested_all)
    return [p for p in pending if p.split("/")[-1] not in skip]
