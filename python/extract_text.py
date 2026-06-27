"""Text extraction for supported document types (mirrors batch-ingest edge function)."""

from __future__ import annotations

import io
import zipfile
import xml.etree.ElementTree as ET
from typing import BinaryIO

import mammoth
from pypdf import PdfReader

SUPPORTED = frozenset({"pdf", "docx", "doc", "pptx", "txt", "md", "csv", "json"})


def extract_text(buffer: bytes, ext: str) -> str:
    ext = ext.lower().lstrip(".")
    if ext not in SUPPORTED:
        raise ValueError(f"Unsupported file type: .{ext}")

    if ext == "pdf":
        return _extract_pdf(buffer)
    if ext in {"docx", "doc"}:
        return _extract_docx(buffer)
    if ext == "pptx":
        return _extract_pptx(buffer)
    return buffer.decode("utf-8", errors="replace")


def _extract_pdf(buffer: bytes) -> str:
    reader = PdfReader(io.BytesIO(buffer))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def _extract_docx(buffer: bytes) -> str:
    result = mammoth.extract_raw_text(io.BytesIO(buffer))
    if result.messages:
        warnings = [str(m) for m in result.messages]
        if warnings:
            print(f"  mammoth warnings: {warnings[:3]}")
    return result.value or ""


def _extract_pptx(buffer: bytes) -> str:
    # Walk slide XML like the Deno edge function (a:t text nodes).
    texts: list[str] = []
    ns = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}

    with zipfile.ZipFile(io.BytesIO(buffer)) as zf:
        slide_names = sorted(
            n for n in zf.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")
        )
        for name in slide_names:
            xml = zf.read(name)
            root = ET.fromstring(xml)
            slide_bits = [
                el.text.strip()
                for el in root.iter(f"{{{ns['a']}}}t")
                if el.text and el.text.strip()
            ]
            if slide_bits:
                texts.append(" ".join(slide_bits))

    return "\n\n".join(texts)
