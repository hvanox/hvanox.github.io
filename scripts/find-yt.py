#!/usr/bin/env python3
"""Ищет официальные клипы на YouTube: поиск -> первые ID -> oEmbed (название+автор).

Использование: python3 scripts/find-yt.py "запрос" [запрос...]
"""
import json
import re
import subprocess
import sys
import time
import urllib.parse

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"


def get(url: str) -> bytes:
    return subprocess.run(
        ["curl", "-s", "--max-time", "25", "-A", UA, url], capture_output=True
    ).stdout


def main(queries: list[str]) -> None:
    for q in queries:
        print(f"===== {q} =====")
        html = get(
            "https://www.youtube.com/results?search_query="
            + urllib.parse.quote_plus(q)
            + "&hl=ja"
        ).decode("utf-8", "replace")
        ids = list(dict.fromkeys(re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', html)))[:10]
        for vid in ids:
            try:
                raw = get(
                    "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
                    + vid
                    + "&format=json"
                )
                d = json.loads(raw)
                print(f"{vid} | {d.get('author_name')} | {d.get('title')}")
            except Exception as exc:  # noqa: BLE001
                print(f"{vid} | OEMBED FAIL {exc}")
            time.sleep(0.3)


if __name__ == "__main__":
    main(sys.argv[1:])
