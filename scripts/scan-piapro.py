#!/usr/bin/env python3
"""Сканирует страницы треков piapro: название, автор, лицензия, mp3-превью.

Использование: python3 scripts/scan-piapro.py /t/ID [/t/ID ...]
Вывод: таблица для отбора треков в плейлист (только некоммерческие + mp3).
"""
import html
import re
import subprocess
import sys

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"


def fetch(url: str, head: bool = False) -> tuple[str, str]:
    cmd = ["curl", "-s", "--max-time", "25", "-A", UA]
    if head:
        cmd += ["-I"]
    cmd.append(url)
    p = subprocess.run(cmd, capture_output=True)
    out = p.stdout.decode("utf-8", "replace")
    return out, url


def clean(raw: str) -> list[str]:
    text = re.sub(r"<script.*?</script>", " ", raw, flags=re.S)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.S)
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"</p>|</div>|</li>|</h\d>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


def main(ids: list[str]) -> None:
    for tid in ids:
        url = f"https://piapro.jp/t/{tid}"
        try:
            raw, _ = fetch(url)
        except Exception as exc:  # noqa: BLE001
            print(f"{tid} | FETCH FAIL {exc}")
            continue
        if len(raw) < 5000:
            print(f"{tid} | SKIP len={len(raw)}")
            continue
        m = re.search(r"<title>([^<]*)</title>", raw)
        title = html.unescape(m.group(1)).strip()[:70] if m else "?"
        lines = clean(raw)
        lic = " ".join(
            ln for ln in lines if any(k in ln for k in ("非営利", "商用", "氏名", "改変", "禁止", "ライセンス"))
        )[:110]
        mp3s = re.findall(r"https://cdn\.piapro\.jp/[^\"']*?\.mp3", raw)
        mp3 = ""
        for cand in dict.fromkeys(mp3s):
            head, _ = fetch(cand, head=True)
            low = head.lower()
            if "audio/mpeg" in low or "audio/mp3" in low:
                mp3 = cand
                break
        # эвристика текста песни: самая длинная серия коротких строк с каной
        kana = re.compile(r"[ぁ-んァ-ン]")
        best: list[str] = []
        run: list[str] = []
        for ln in lines:
            if 2 <= len(ln) <= 45 and kana.search(ln):
                run.append(ln)
            else:
                if len(run) > len(best):
                    best = run
                run = []
        print(f"{tid} | {title}")
        print(f"   lic: {lic or '—'}")
        print(f"   mp3: {'OK ' + mp3 if mp3 else 'NONE ' + str(mp3s[:1])}")
        print(f"   lyrics_run: {len(best)} lines, e.g. {best[:2]}")


if __name__ == "__main__":
    main([a.removeprefix("/t/") for a in sys.argv[1:]])
