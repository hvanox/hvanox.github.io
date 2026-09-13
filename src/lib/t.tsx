"use client";

/**
 * Клиентский лист для локализованной строки.
 *
 * Зачем: `t()` живёт в контексте (client), а секции по правилам архитектуры —
 * Server Components. Один крошечный client-лист на строку дешевле, чем
 * помечать `"use client"` половину дерева.
 */

import { useI18n, type Localized } from "@/lib/i18n";

export function T({ value }: { value: Localized }) {
  const { t } = useI18n();
  return <>{t(value)}</>;
}
