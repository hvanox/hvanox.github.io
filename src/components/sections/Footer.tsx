import { dict } from "@/content/dict";
import { profile, stack } from "@/content/profile";
import { T } from "@/lib/t";

/**
 * Подвал: копирайт, на чём собрано (стек из profile.ts, не хардкод),
 * пометка «вечно в разработке». Server Component.
 */

const technologies = stack.flatMap((group) => group.items).join(", ");

export function Footer() {
  return (
    <footer className="border border-chrome bg-void-deep px-3 py-2 shadow-hard">
      <p className="m-0 font-pixel text-[10px] leading-relaxed tracking-[0.06em] text-bone uppercase">
        © {profile.handle} 2026
      </p>
      <p className="m-0 mt-1 font-mono text-[11px] leading-snug text-bone-dim">
        <T value={dict.footer.built} /> {technologies}
      </p>
      <p className="m-0 mt-1 font-pixel text-[10px] leading-snug tracking-[0.06em] text-blood uppercase">
        <T value={dict.footer.construction} />
      </p>
    </footer>
  );
}
