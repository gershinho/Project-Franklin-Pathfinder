"""Supabase client helpers for local ingest scripts."""

from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from supabase import Client, create_client


def _load_env() -> None:
    root = Path(__file__).resolve().parent.parent
    load_dotenv(root / ".env")


def supabase_url() -> str:
    _load_env()
    raw = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    if not raw:
        raise RuntimeError(
            "Missing SUPABASE_URL or VITE_SUPABASE_URL in .env"
        )
    return _normalize_supabase_base_url(raw)


def _normalize_supabase_base_url(url: str) -> str:
    """Strip /rest/v1 and other path suffixes; keep scheme + host only."""
    parsed = urlparse(url.strip())
    if not parsed.scheme or not parsed.netloc:
        raise RuntimeError(f"Invalid Supabase URL: {url!r}")
    return f"{parsed.scheme}://{parsed.netloc}"


def service_role_key() -> str:
    _load_env()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        raise RuntimeError(
            "Missing SUPABASE_SERVICE_ROLE_KEY in .env "
            "(Project Settings → API → service_role key)"
        )
    return key


def ingest_secret() -> str:
    _load_env()
    secret = os.environ.get("INGEST_SECRET")
    if not secret:
        raise RuntimeError(
            "Missing INGEST_SECRET in .env "
            "(same value used by batch-ingest / classify-chunk edge functions)"
        )
    return secret


def voyage_api_key() -> str:
    _load_env()
    key = os.environ.get("VOYAGE_API_KEY")
    if not key:
        raise RuntimeError("Missing VOYAGE_API_KEY in .env")
    return key


def create_service_client() -> Client:
    _load_env()
    return create_client(supabase_url(), service_role_key())
