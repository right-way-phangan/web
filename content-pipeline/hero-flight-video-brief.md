# Hero-flight — бриф на видео «пролёт над Панганом с пикированием»

Ролик для скраб-героя главной ([hero-flight.tsx](../src/components/sections/hero-flight.tsx)): скролл гонит таймлайн видео — камера **высоко над островом → пикирование к берегу → торможение низко над виллами/пляжем**. По ходу пике всплывают три титра-фишки, «приземление» переходит в обычный hero. Видео генерирует Владимир на **Higgsfield / Seedance / Veo**, здесь — что именно просить.

## Глобальная спека (одинаково для всех клипов)

- **Формат:** 16:9 landscape, 1080p (или максимум, что даёт модель), **24 fps**, без звука.
- **Структура:** 3 клипа по ~5 сек → склейка кроссфейдами в мастер ~10–12 сек.
- **Стиль-токены (в каждый промпт):** `photorealistic cinematic drone footage, golden hour, teal-emerald sea, warm amber horizon light, smooth constant camera motion, no shake, no cuts`.
- **Негативы:** `no text, no watermark, no logos, no people close-ups, no birds crossing lens, no morphing/warped buildings, no jump cuts`.
- **Палитра:** тянуть к Coastal Twilight — бирюзовая вода, тёплый янтарный свет на горизонте (совпадает с hero-сценами). Направление солнца держать постоянным между клипами (в `scene-3.jpg` солнце слева — так и оставить).
- **Критерий отбора:** генерить **2–3 сида на клип**, выбирать по **плавности движения**, а не по красоте кадра — скраб усиливает любой judder и морфинг геометрии. Клипы с «плывущими» зданиями/береговой линией — брак.

## Клипы и непрерывность (image-to-video chaining)

Непрерывность держим тем, что **старт-кадр клипа N+1 = последний кадр клипа N**. Достать последний кадр:

```bash
ffmpeg -sseof -0.05 -i clipN.mp4 -frames:v 1 -q:v 2 clipN-end.jpg
```

### Клип 1 — высотный пролёт
- **Старт-кадр:** `web/public/hero/scene-3.jpg` (самый «высотный», панорама).
- **Higgsfield:** image-to-video, пресет камеры **Drone Dive** (или **FPV** forward-descending).
- **Промпт:** `High-altitude aerial over a tropical island at golden hour; camera flies forward and begins a slow descent toward the coastline; islands on the horizon; teal sea, amber sky.` + стиль-токены/негативы.
- **Veo 3 / Seedance:** тот же текст + `camera: forward dolly with gradual descent, constant speed, 5 seconds`.

### Клип 2 — пике
- **Старт-кадр:** последний кадр клипа 1 (`clip1-end.jpg`). Если непригоден — `web/public/hero/scene-4.jpg`.
- **Higgsfield:** пресет **FPV Drone**.
- **Промпт:** `FPV drone dives toward a turquoise horseshoe bay; slight acceleration then easing; jungle hills and beach detail resolve; coastline fills the frame.` + токены/негативы.

### Клип 3 — глайд-приземление
- **Старт-кадр:** последний кадр клипа 2.
- **🔴 End-frame / reference (где модель поддерживает — Higgsfield start+end, Veo reference image):** `web/public/hero-phangan.jpg`. Финальный кадр видео должен **≈ совпасть с LCP-фото hero** — тогда fade-out (прогресс 0.84–0.96) сшивается с настоящим hero бесшовно.
- **Промпт:** `Low drone glide decelerating over a beachfront with tropical villas and palms, settling toward a steady wide shot, nearly static at the end, golden hour.` + токены/негативы.

## Сборка и энкод (ffmpeg)

**1. Склейка 3×5s кроссфейдами** (offset пересчитать по факту длительностей):

```bash
ffmpeg -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 -filter_complex \
"[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v01]; \
 [v01][2:v]xfade=transition=fade:duration=0.5:offset=9.0[v]" \
-map "[v]" -an -r 24 -pix_fmt yuv420p -crf 14 -preset slow master-dive.mp4
```

**2. Грейд (опционально — лучше добиться палитры в промпте):**

```bash
ffmpeg -i master-dive.mp4 -vf \
"eq=saturation=1.05:contrast=1.03, \
 curves=blue='0/0.02 0.5/0.52 1/0.98':red='0/0 0.6/0.63 1/1', \
 colorbalance=sm=0.05:sh=0.04:hm=-0.04" \
-an -crf 14 -preset slow master-graded.mp4
```

**3. Скраб-энкод — кандидат A (дефолт), short-GOP без B-кадров** (seek декодит ≤4 кадра, ~5–9 МБ):

```bash
ffmpeg -i master-graded.mp4 -an \
 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
 -c:v libx264 -profile:v high -preset slow -crf 23 \
 -g 4 -keyint_min 4 -bf 0 -sc_threshold 0 \
 -pix_fmt yuv420p -movflags +faststart flight-v1-1080.mp4
```

**Кандидат B (если в Safari виден jitter при скрабе) — all-intra** `-g 1 -crf 27` (~11–17 МБ). **Жёсткий бюджет: ≤ 12 МБ.** Превышение → `scale=1600:900`.

**4. Постер** (для соцсетей/OG — НЕ LCP; LCP остаётся hero-фото):

```bash
ffmpeg -i flight-v1-1080.mp4 -frames:v 1 -q:v 3 flight-v1-poster.jpg
```

## Загрузка в R2 и включение

1. **Имя иммутабельное, версионированное:** `hero/flight-v1-1080.mp4` (следующий монтаж — `v2`, не перезаписывать).
   ```bash
   npx wrangler r2 object put <bucket>/hero/flight-v1-1080.mp4 --file flight-v1-1080.mp4 --content-type video/mp4
   ```
2. **Обновить ключ в коде:** [hero-flight.tsx](../src/components/sections/hero-flight.tsx) → `VIDEO_KEY` (сейчас плейсхолдер `hero/flight-dev-1080.mp4`).
3. **CORS на бакете (опционально, ради бесплатного egress прямого r2.dev):** разрешить `GET` с `https://rightwaygroup.co`, `https://*.vercel.app`, `http://localhost:3000`. Без CORS код сам падает на same-origin `/media/r2/*` (тоже работает, но идёт через Vercel-трафик).
4. **Включить в проде:** `NEXT_PUBLIC_HERO_FLIGHT=1` в Vercel Production env + redeploy (флаг инлайнится при билде). Откат — снять флаг.

## Dev-плейсхолдер (пока ролика нет)

Чтобы проверять механизм до готового видео: взять `verana-phase-2-drone.mp4` из R2, обрезать ~10s, прогнать энкод по п.3, залить как `hero/flight-dev-1080.mp4` (ключ в коде уже указывает на него). Если файла в R2 нет — hero-flight просто не включится и покажет сегодняшний hero (безопасная деградация).
