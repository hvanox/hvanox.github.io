#!/usr/bin/env python3
"""Синтезирует дарк-джангл/брейккор луп (амен-паттерн, ~174 bpm) в WAV.

Только numpy + wave из стандартной цепочки. Ничего чужого: трек для плеера
собирается здесь же, лицензия чистая — сделано сайтом для сайта.
Использование: python3 scripts/make-loop.py  ->  public/audio/loop.wav
"""
import wave

import numpy as np

SR = 44100
BPM = 174
BEAT = 60.0 / BPM
STEP = BEAT / 4  # 16-е

rng = np.random.default_rng(0xBEA7)


def secs(n_steps: int) -> float:
    return n_steps * STEP


def kick(n: int) -> np.ndarray:
    t = np.arange(n) / SR
    pitch = 45 + 115 * np.exp(-t * 55)
    body = np.sin(2 * np.pi * pitch * t) * np.exp(-t * 22)
    click = np.sign(rng.standard_normal(n)) * np.exp(-t * 320) * 0.35
    return body + click


def snare(n: int) -> np.ndarray:
    t = np.arange(n) / SR
    noise = np.sign(rng.standard_normal(n)) * np.exp(-t * 28)
    tone = np.sin(2 * np.pi * 196 * t) * np.exp(-t * 30) * 0.7
    snap = np.sign(rng.standard_normal(n)) * np.exp(-t * 160) * 0.4
    return noise * 0.8 + tone + snap


def hat(n: int, open_: bool = False) -> np.ndarray:
    t = np.arange(n) / SR
    decay = 90 if not open_ else 22
    noise = np.sign(rng.standard_normal(n)) * np.exp(-t * decay)
    # грубый highpass: вычитаем скользящее среднее
    k = 24
    kernel = np.ones(k) / k
    smooth = np.convolve(noise, kernel, mode="same")
    return (noise - smooth) * 0.5


def bass_note(freq: float, n: int) -> np.ndarray:
    t = np.arange(n) / SR
    raw = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * 2 * freq * t)
    # дисторшн в духе брейккора: жёсткий клиппинг + лёгкий биткраш
    crushed = np.round(raw * 24) / 24
    return np.tanh(crushed * 3.2) * 0.8


def pad(freqs: list[float], n: int) -> np.ndarray:
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        out += np.sin(2 * np.pi * f * t + rng.random() * 6.28)
        out += 0.5 * np.sin(2 * np.pi * f * 1.007 * t)
    out /= len(freqs) * 1.5
    # медленная атака/затухание, однополюсный lowpass для темноты
    env = np.minimum(1, np.arange(n) / (SR * 3))
    env *= np.minimum(1, np.arange(n)[::-1] / (SR * 3))
    alpha = 0.06
    dark = np.zeros(n)
    for i in range(1, n):
        dark[i] = dark[i - 1] + alpha * (out[i] - dark[i - 1])
    return dark * env * 0.5


def place(track: np.ndarray, sample: np.ndarray, at_step: int, gain: float = 1.0) -> None:
    start = int(at_step * STEP * SR)
    end = min(len(track), start + len(sample))
    if start < len(track):
        track[start:end] += sample[: end - start] * gain


def main() -> None:
    bars = 8
    steps = bars * 16
    total = int(secs(steps) * SR) + SR
    drums = np.zeros(total)
    bass = np.zeros(total)

    k_len = int(0.30 * SR)
    s_len = int(0.28 * SR)
    h_len = int(0.10 * SR)
    ho_len = int(0.35 * SR)
    K, S, H, HO = kick(k_len), snare(s_len), hat(h_len), hat(ho_len, True)

    # Амен-скелет: снейр на 4 и 12 шаге такта, кик синкопирован, хэт качает 8-ми.
    for bar in range(bars):
        b = bar * 16
        last = bar == bars - 1
        for s in range(16):
            g = b + s
            if s % 2 == 0:
                place(drums, H, g, 0.5 if s % 4 == 2 else 0.35)
            if s in (0, 7, 10) or (last and s in (0, 3, 6, 8, 11, 14)):
                place(drums, K, g, 0.9)
            if s in (4, 12) or (last and s == 15):
                place(drums, S, g, 1.0)
            if last and s >= 12:
                place(drums, H, g, 0.3)  # ролл в филл
        if bar % 2 == 0:
            place(drums, HO, b + 14, 0.4)

    # Басовый рифф, D minor: D2 D2 F2 C2 ... с октавными прыжками.
    riff = [73.42, 73.42, 87.31, 65.41, 73.42, 73.42, 98.0, 146.83]
    for bar in range(bars):
        note = riff[bar % len(riff)]
        n_len = int(BEAT * 3.2 * SR)
        place(bass, bass_note(note, n_len), bar * 16, 0.75)
        if bar % 2 == 1:  # октавный ответ
            place(bass, bass_note(note * 2, int(BEAT * SR)), bar * 16 + 12, 0.5)

    dark_pad = pad([73.42, 87.31, 110.0], total)

    mix = drums * 0.9 + bass * 0.85 + dark_pad
    # финальный glue: мягкий лимитер
    mix = np.tanh(mix * 1.1) * 0.89
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)

    out = "public/audio/loop.wav"
    with wave.open(out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{out}: {len(pcm) / SR:.1f}s, {len(pcm) * 2 / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
