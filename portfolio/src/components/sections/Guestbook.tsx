import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { profile } from "@/content/profile";
import { T } from "@/lib/t";

/**
 * Гостевая-заглушка. Сервера нет (статический экспорт), поэтому честно
 * говорим, что гостевой нет, и даём ссылку на телеграм из profile.contacts.
 * Server Component: интерактива нет, локализация через <T/>.
 */

export function Guestbook() {
  return (
    <Win98Window title={dict.sections.guestbook}>
      <p className="m-0 font-mono text-xs leading-snug text-bone">
        <T value={dict.guestbook.stub} />
      </p>
      <p className="m-0 mt-2 font-mono text-xs leading-snug">
        <a
          href={profile.contacts.telegram.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile.contacts.telegram.label}
        </a>
      </p>
    </Win98Window>
  );
}
