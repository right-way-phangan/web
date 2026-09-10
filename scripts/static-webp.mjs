// Готовит WebP-варианты для статичных фото из /public (районы, hero).
// Зачем: images.unoptimized (квота Hobby исчерпана) отдаёт исходный JPEG без
// srcset — телефон тянул 1600px-кадры по 250–600 КБ. Варианты кладутся рядом
// с оригиналом, оригинал остаётся fallback-`src` (см. ui/static-photo.tsx).
// Запуск: node scripts/static-webp.mjs — после нового фото района или сцены hero.
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const JOBS = [
  {
    files: readdirSync("public/images/districts")
      .filter((f) => /\.jpe?g$/i.test(f))
      .map((f) => path.join("public/images/districts", f)),
    variants: [["-sm", 640], ["-md", 1280]],
  },
  {
    files: [
      "public/hero-phangan.jpg",
      ...readdirSync("public/hero")
        .filter((f) => /^scene-\d+\.jpe?g$/i.test(f))
        .map((f) => path.join("public/hero", f)),
    ],
    variants: [["-sm", 960], ["-lg", 1800]],
  },
];

for (const job of JOBS) {
  for (const file of job.files) {
    const base = file.replace(/\.[a-z]+$/i, "");
    for (const [suffix, width] of job.variants) {
      const out = `${base}${suffix}.webp`;
      const info = await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 68, effort: 6 })
        .toFile(out);
      console.log(`${out} ${info.width}px ${Math.round(info.size / 1024)} KB`);
    }
  }
}
