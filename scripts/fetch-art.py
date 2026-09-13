#!/usr/bin/env python3
"""Скачивает фанарты Kasane Teto с danbooru (rating:general) в public/art
и пишет манифест с именем художника для мелкой подписи."""
import json
import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "art"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST = ROOT / "src" / "content" / "art.json"
MANIFEST.parent.mkdir(parents=True, exist_ok=True)

UA = {"User-Agent": "hvano-portfolio/1.0 (personal static site build)"}
API = "https://danbooru.donmai.us/posts.json"


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()


def fetch_posts(tags: str, limit: int, pages: int = 1) -> list[dict]:
    posts: list[dict] = []
    for page in range(1, pages + 1):
        url = f"{API}?tags={tags}&limit={limit}&page={page}"
        posts += json.loads(get(url))
        time.sleep(1)
    return posts


def main() -> None:
    # danbooru без аккаунта: максимум 2 тега в запросе, остальное фильтруем локально
    raw = fetch_posts("kasane_teto+rating:general", 200, 4)
    print(f"posts from api: {len(raw)}")

    seen: set[str] = set()
    entries: list[dict] = []
    for p in raw:
        artist = (p.get("tag_string_artist") or "").split(" ")[0]
        url = p.get("large_file_url") or p.get("file_url")
        ext = (p.get("file_ext") or "").lower()
        tags = p.get("tag_string_general") or ""
        if not url or not artist or ext not in {"jpg", "jpeg", "png", "webp"}:
            continue
        if any(bad in tags for bad in ("comic", "photo_(medium)", "multiple_views")):
            continue
        if artist in seen:  # не более одного арта на художника
            continue
        w, h = p.get("image_width") or 0, p.get("image_height") or 0
        if w < 600 or h < 600:
            continue
        seen.add(artist)
        entries.append(
            {
                "id": p["id"],
                "artist": artist,
                "url": url,
                "width": w,
                "height": h,
                "ratio": "portrait" if h > w * 1.1 else "landscape" if w > h * 1.1 else "square",
            }
        )
        if len(entries) >= 26:
            break

    manifest = []
    for e in entries:
        ext = e["url"].rsplit(".", 1)[-1].split("?")[0]
        name = f"teto-{e['id']}.{ext}"
        dest = OUT / name
        if not dest.exists():
            try:
                dest.write_bytes(get(e["url"]))
            except Exception as exc:  # noqa: BLE001
                print(f"skip {e['id']}: {exc}")
                continue
            time.sleep(0.4)
        manifest.append(
            {
                "src": f"/art/{name}",
                "artist": e["artist"],
                "width": e["width"],
                "height": e["height"],
                "ratio": e["ratio"],
            }
        )
        print(f"ok {name} <- {e['artist']}")

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"\n{len(manifest)} arts -> {MANIFEST}")


if __name__ == "__main__":
    main()
