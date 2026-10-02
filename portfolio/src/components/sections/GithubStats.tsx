"use client";

import { useQuery } from "@tanstack/react-query";
import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { profile } from "@/content/profile";
import { useI18n } from "@/lib/i18n";

/**
 * Публичная статистика GitHub. Без токена: эндпоинт /users/{login} открытый.
 * isPending -> скелет по форме будущих строк, isError -> честная строка
 * «недоступно». Числа не выдумываем ни при каких условиях.
 */

/** Логин берём из ссылки в profile.contacts, чтобы не держать его в двух местах. */
const login = profile.contacts.github.href.replace(/^https:\/\/github\.com\//, "");

type GithubUser = {
  public_repos: number;
  followers: number;
  created_at: string;
};

async function fetchGithubUser(): Promise<GithubUser> {
  const res = await fetch(`https://api.github.com/users/${login}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`github: ${res.status}`);
  return (await res.json()) as GithubUser;
}

export function GithubStats() {
  const { locale, t } = useI18n();
  const { data, isPending, isError } = useQuery({
    queryKey: ["github", login],
    queryFn: fetchGithubUser,
  });

  return (
    <Win98Window title={dict.sections.github}>
      {isPending ? (
        // Скелет повторяет форму строк, чтобы раскладка не дёргалась.
        <ul aria-hidden="true" className="m-0 flex list-none flex-col gap-2 p-0">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="block h-4 w-10 bg-chrome/25" />
              <span className="block h-2.5 w-24 bg-chrome/15" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="font-mono text-xs leading-snug text-bone-dim">
          {t(dict.github.unavailable)}
        </p>
      ) : (
        <dl className="m-0 flex flex-col gap-2">
          <Stat value={String(data.public_repos)} label={t(dict.github.repos)} />
          <Stat value={String(data.followers)} label={t(dict.github.followers)} />
          <Stat
            value={new Date(data.created_at).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
            })}
            label={t(dict.github.joined)}
          />
        </dl>
      )}
    </Win98Window>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <dd className="m-0 font-display text-xl leading-none tracking-[0.04em] text-acid">{value}</dd>
      <dt className="font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">{label}</dt>
    </div>
  );
}
