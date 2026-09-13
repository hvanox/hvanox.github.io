/**
 * Плейлист плеера. Два вида источников:
 * - локальные файлы из public/audio (положить .m4a/.mp3 рядом, src вида "/audio/x.m4a");
 * - внешние стримы (обычный https-URL). Играют напрямую, без визуализатора:
 *   чужой сервер почти наверняка не отдаёт CORS-заголовки, а без них
 *   WebAudio-граф глушит звук — поэтому анализатор только для своих файлов.
 *
 * Текст (название + автор) показывается в плеере всегда — это и есть
 * подписи треков. Лицензия: свои файлы — свои права; чужие стримы добавляй
 * только с разрешения автора или свободные (CC, netlabel).
 */

export type Track = {
  id: string;
  title: string;
  artist: string;
  /** "/audio/...." — свой файл; "https://..." — внешний стрим. */
  src: string;
  /** Зациклить (для коротких лупов вроде loop.m4a). */
  loop?: boolean;
};

export const playlist: Track[] = [
  {
    id: "amen-loop",
    title: "amen loop 174",
    artist: "synthesized on this site",
    src: "/audio/loop.m4a",
    loop: true,
  },
  // Пример внешнего стрима (раскомментируй и подставь свой URL):
  // { id: "stream-1", title: "....", artist: "....", src: "https://....mp3" },
];

/** Свой файл (лежит рядом на Pages) или чужой стрим. */
export function isLocalTrack(src: string): boolean {
  return src.startsWith("/");
}
