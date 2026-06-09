# Site audit — автоматическая проверка rightwaygroup.co

Headless-обход живого сайта, который ловит классы регрессий, найденные в ручном аудите 10 июня 2026. Запускается руками или по расписанию; падает (exit 1) только когда что-то реально сломалось.

## Что проверяет

| Проверка | Статус при проблеме | Что значит |
|----------|--------------------|------------|
| `links_all_200` | FAIL | битая ссылка / страница не 200 |
| `hydration_418` | FAIL | React #418 — рассинхрон SSR↔client (напр. `toLocaleString` без локали) |
| `page_exceptions` | FAIL | непойманные JS-исключения на странице |
| `mobile_overflow` | FAIL | горизонтальный «разъезд» вёрстки на мобильном (>8px) |
| `cyrillic_on_en` | FAIL | русский текст утёк на английские страницы (обычно — данные из amoCRM) |
| `console_errors` | WARN | ошибки в консоли |
| `failed_requests` | WARN | упавшие сетевые запросы (бенин `_rsc` префетчи отфильтрованы) |
| `scroll_jank` | WARN | страница «дёргается» вверх при прокрутке |
| `ru_og_locale` / `ru_html_lang` | WARN | RU-страницы отдают неверную локаль |
| `robots` / `sitemap` | WARN | недоступны |

## Запуск вручную

```bash
cd web/scripts/audit
bash run-audit.sh            # быстрый прогон по прод (сэмпл детальных страниц)
bash run-audit.sh --full     # обойти ВСЕ внутренние ссылки (медленно, ~7 мин)
AUDIT_BASE=https://preview-… bash run-audit.sh   # против превью/стейджа
```

Раннер сам ставит `puppeteer-core` в `~/.rw-site-audit/` (не трогает `package.json` репо) и находит Chrome. Отчёты — в `~/.rw-site-audit/reports/` (`latest.log`, `latest.json` + датированные копии, чистятся через 60 дней).

## Расписание

См. `com.rightway.site-audit.plist` (launchd, macOS) в этой папке — копия лежит в `~/Library/LaunchAgents/`. Меняешь периодичность там → `launchctl unload/load`.

## Зависимости
- Node 18+, npm
- Google Chrome (или Chromium) — путь автоопределяется, можно задать `CHROME_PATH`
