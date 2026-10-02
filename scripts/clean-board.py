"""
Готовит фон борда из эдита «Kasane teto edit vocaloid.jpg» (by reathaa).

Картинка — это и есть сайт: панели, Тето, рамки остаются как есть, а зашитый
текст («Lucky Girl», «Status : Alive», «6:30:00 PM» …) затирается цветом
панели, чтобы поверх лёг живой текст из src/content. Координаты — в пикселях
исходника 736×414, те же, что у оверлеев в src/components/board/.

Ещё режет обложку для окна плеера из «UTAUloid _3.jpg».

Заменяются только пиксели букв (по оттенку «подложка → текст»): средний
цвет подложки + зерно той же силы. Тени, пальцы Тето и рамки не трогаются.

Запуск (нужны Pillow, numpy, opencv-python-headless):
    python scripts/clean-board.py
"""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "board"
SCALE = 2

# (x0, y0, x1, y1) — прямоугольники с зашитым текстом.
TEXT_BOXES = [
    # карточка «Lucky Girl»
    (118, 22, 184, 30),  # Lucky Girl
    (104, 38, 197, 63),  # абзац
    (108, 147, 192, 170),  # Bunnies
    # STEAMPUNK
    (213, 14, 318, 22),
    (263, 25, 303, 39),
    # User Interface
    (220, 153, 275, 160),
    # GFX / Graphic Design
    (419, 47, 480, 77),
    (417, 121, 491, 146),
    # on / off
    (507, 109, 521, 116),
    (548, 109, 563, 116),
    # Success! / Import
    (638, 110, 707, 131),
    (648, 131, 692, 144),
    # System Message
    (582, 167, 652, 177),
    (597, 187, 703, 211),
    (611, 228, 631, 240),
    (667, 228, 699, 240),
    # Heaven
    (479, 202, 512, 207),
    # Document of …
    (425, 250, 487, 258),
    (438, 271, 506, 280),
    # Virtual Picture.
    (561, 266, 631, 280),
    (665, 266, 691, 280),
    (550, 290, 627, 300),
    (669, 309, 711, 319),
    (669, 326, 711, 336),
    # Songs
    (17, 198, 47, 211),
    (59, 198, 91, 211),
    (22, 291, 96, 326),
    (21, 334, 40, 340),
    (61, 335, 95, 340),
    (55, 351, 76, 357),
    (21, 368, 40, 373),
    (61, 368, 95, 373),
    (55, 384, 76, 390),
    # "Game" of Gear
    (109, 192, 157, 217),
    # Date / Date
    (112, 339, 135, 351),
    (159, 339, 182, 351),
    # часы
    (108, 367, 260, 399),
    # Loading
    (209, 197, 263, 208),
    # Height / Blood Type / Status
    (206, 256, 242, 273),
    (206, 283, 286, 297),
    (206, 305, 280, 323),
]

# Надписи с обводкой на однотонной ленте: стираются целиком, лента протягивается.
FLAT_BOXES = [
    (165, 179, 268, 189),  # MADE BY REATHAA
]


def patch(rgb: np.ndarray, box: tuple[int, int, int, int], rng: np.random.Generator) -> None:
    """
    Стирает надпись в прямоугольнике. Меняются только пиксели букв: цвет
    лежит на отрезке «подложка → цвет текста». Всё, что другого оттенка
    (тень руки, пальцы, рамки, волосы), остаётся как было.
    """
    x0, y0, x1, y1 = box
    X0, Y0, X1, Y1 = x0 * SCALE, y0 * SCALE, (x1 + 1) * SCALE, (y1 + 1) * SCALE
    region = rgb[Y0:Y1, X0:X1]
    flat_px = region.reshape(-1, 3)

    bg = np.median(flat_px, axis=0)
    dist = np.linalg.norm(flat_px - bg, axis=1)
    text = np.median(flat_px[dist >= np.percentile(dist, 92)], axis=0)
    axis = text - bg
    length = max(np.linalg.norm(axis), 1.0)

    rel = region - bg
    t = (rel @ axis) / (length**2)
    perp = np.linalg.norm(rel - t[..., None] * axis, axis=2)
    same_hue = perp < 0.1 * length + 8

    core = (t > 0.22) & same_hue
    # Ореолы JPEG вокруг букв — и светлые, и тёмная кайма (t < 0):
    # всё того же оттенка в окрестности букв уходит под заливку.
    grown = cv2.dilate(core.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=4).astype(bool)
    mask = grown & same_hue

    bg_px = flat_px[(dist < 26)]
    if len(bg_px) < 8:
        bg_px = flat_px
    mean = bg_px.mean(axis=0)
    std = np.clip(bg_px.std(axis=0), 2, 9)
    fill = mean + rng.normal(0, 1, region.shape) * std
    region[mask] = fill[mask]


def clean() -> None:
    src = Image.open(ROOT / "Kasane teto edit vocaloid.jpg").convert("RGB")
    big = src.resize((src.width * SCALE, src.height * SCALE), Image.LANCZOS)
    rgb = np.array(big).astype(np.float32)
    rng = np.random.default_rng(7)

    for box in TEXT_BOXES:
        patch(rgb, box, rng)

    # Надпись на красной ленте между панелями. Вертикальный профиль ленты
    # берём слева от надписи, где букв нет; поперечные оттенки (светлая
    # вертикальная полоса) — из строки сразу под надписью, если там лента.
    for x0, y0, x1, y1 in FLAT_BOXES:
        X0, X1 = x0 * SCALE, (x1 + 1) * SCALE
        Y0, Y1 = y0 * SCALE, (y1 + 1) * SCALE
        profile = rgb[Y0:Y1, X0 - 10 : X0 - 2].mean(axis=1)  # (h, 3)
        below = rgb[Y1 + 1 : Y1 + 3, X0:X1].mean(axis=0)  # (w, 3)
        ref = rgb[Y1 + 1 : Y1 + 3, X0 - 10 : X0 - 2].reshape(-1, 3).mean(axis=0)
        offset = below - ref
        # Где под надписью уже серая панель, а не лента, — без сдвига.
        offset[below.mean(axis=1) > 150] = 0
        # Только осветление (светлая полоса); тёмные щели между панелями не тянем.
        offset = np.clip(offset, 0, 40)
        offset = cv2.blur(offset[None].astype(np.float32), (7, 1))[0]
        fill = profile[:, None, :] + offset[None, :, :]
        rgb[Y0:Y1, X0:X1] = fill + rng.normal(0, 4, fill.shape)

    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    out = out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))
    out.save(OUT / "board.webp", "WEBP", quality=90, method=6)
    print("board.webp", out.size)


def cover() -> None:
    src = Image.open(ROOT / "UTAUloid _3.jpg").convert("RGB")
    crop = src.crop((414, 50, 684, 300))
    big = crop.resize((crop.width * SCALE, crop.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    big.save(OUT / "utau-cover.webp", "WEBP", quality=88, method=6)
    print("utau-cover.webp", big.size)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    clean()
    cover()
