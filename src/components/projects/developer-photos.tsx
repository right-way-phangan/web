"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PhotoLightbox, type LightboxPhoto } from "@/components/media/photo-lightbox";

/** Одна проектная группа внутри общего плоского списка кадров. */
export interface DeveloperPhotoGroup {
  /** Имя проекта — совпадает с `title` записи таймлайна, это и есть ключ связи. */
  title: string;
  note?: string;
  /** Индекс первого кадра группы в общем списке. */
  start: number;
  count: number;
}

interface PhotosApi {
  groups: DeveloperPhotoGroup[];
  /** Открыть лайтбокс на конкретном кадре общего списка. */
  openAt: (index: number) => void;
  /** Открыть первый кадр проекта по его названию. */
  openGroup: (title: string) => void;
  /** Сколько кадров у проекта — 0, если фото ещё не присылали. */
  countOf: (title: string) => number;
}

const Ctx = createContext<PhotosApi | null>(null);

/**
 * Единственный держатель состояния лайтбокса на странице застройщика.
 *
 * Альбом и лента истории проектов — два отдельных клиентских острова, но фото
 * у них общие: посетитель открывает кадр из карточки проекта в ленте и листает
 * дальше весь альбом, не возвращаясь к сетке. Поэтому список кадров считается
 * на сервере (в developer-page.tsx), а стейт живёт здесь, выше обоих островов.
 */
export function DeveloperPhotosProvider({
  photos,
  groups,
  title,
  labels,
  children,
}: {
  photos: LightboxPhoto[];
  groups: DeveloperPhotoGroup[];
  title: string;
  labels: { prev: string; next: string; close: string };
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const api = useMemo<PhotosApi>(() => {
    const byTitle = new Map(groups.map((g) => [g.title, g]));
    return {
      groups,
      openAt: (i: number) => setIndex(i),
      openGroup: (t: string) => {
        const g = byTitle.get(t);
        if (g) setIndex(g.start);
      },
      countOf: (t: string) => byTitle.get(t)?.count ?? 0,
    };
  }, [groups]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <PhotoLightbox
        photos={photos}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        title={title}
        labels={labels}
      />
    </Ctx.Provider>
  );
}

/** null вне провайдера — вызывающий сам решает, показывать ли крючок на фото. */
export function useDeveloperPhotos(): PhotosApi | null {
  return useContext(Ctx);
}

/** Кнопка-обёртка для кадра: открывает общий лайтбокс на нужном индексе. */
export function usePhotoOpener() {
  const photos = useDeveloperPhotos();
  return useCallback((i: number) => photos?.openAt(i), [photos]);
}
