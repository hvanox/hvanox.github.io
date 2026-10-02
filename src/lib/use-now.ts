"use client";

import { useEffect, useState } from "react";

/**
 * Текущее время, тикающее раз в intervalMs. До монтирования — null:
 * сервер не знает часов посетителя, рассинхрон сломал бы гидрацию.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Полных лет на дату now. */
export function ageAt(bornIso: string, now: Date): number {
  const born = new Date(`${bornIso}T00:00:00`);
  let age = now.getFullYear() - born.getFullYear();
  const beforeBirthday =
    now.getMonth() < born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() < born.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Полных дней с даты рождения. */
export function daysSince(bornIso: string, now: Date): number {
  const born = new Date(`${bornIso}T00:00:00`);
  return Math.floor((now.getTime() - born.getTime()) / 86_400_000);
}
