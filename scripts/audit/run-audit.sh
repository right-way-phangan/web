#!/usr/bin/env bash
# Bootstrap + run the Right Way site audit.
#
# Keeps its puppeteer-core dependency and reports OUTSIDE the repo (in
# ~/.rw-site-audit) so it never touches package.json or pollutes git. Safe to run
# by hand or from a scheduler (launchd / cron / CI).
#
#   bash run-audit.sh              # quick audit vs prod
#   bash run-audit.sh --full       # crawl every internal link
#   AUDIT_BASE=https://staging…  bash run-audit.sh
#
# Exit code mirrors the audit: 0 = clean, 1 = at least one FAIL.
set -euo pipefail

# --notify → post a macOS notification on FAIL (for unattended/launchd runs).
# Stripped here so it isn't passed on to the Node audit.
NOTIFY=0
PASS_ARGS=()
for a in "$@"; do
  if [ "$a" = "--notify" ]; then NOTIFY=1; else PASS_ARGS+=("$a"); fi
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR="${HOME}/.rw-site-audit"
REPORT_DIR="${HOME_DIR}/reports"
mkdir -p "${REPORT_DIR}"

# Guard: не наслаиваться на зависший предыдущий прогон (аудит идёт минуты;
# живой site-audit.mjs к моменту нового запуска — застрявший, июль-2026: висел 4 дня).
pkill -f "${HOME_DIR}/site-audit.mjs" 2>/dev/null || true

# 1. Locate a Chrome/Chromium binary.
if [ -z "${CHROME_PATH:-}" ]; then
  for c in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "$(command -v google-chrome || true)" \
    "$(command -v chromium || true)"; do
    if [ -n "$c" ] && [ -x "$c" ]; then export CHROME_PATH="$c"; break; fi
  done
fi
if [ -z "${CHROME_PATH:-}" ] || [ ! -x "${CHROME_PATH}" ]; then
  echo "✗ No Chrome binary found. Set CHROME_PATH=/path/to/chrome" >&2
  exit 2
fi

# 2. Ensure puppeteer-core is installed in the stable tooling dir.
if [ ! -d "${HOME_DIR}/node_modules/puppeteer-core" ]; then
  echo "Installing puppeteer-core into ${HOME_DIR} (one-time)…" >&2
  cd "${HOME_DIR}"
  [ -f package.json ] || npm init -y >/dev/null 2>&1
  npm i puppeteer-core@23 >/dev/null 2>&1
  cd "${SCRIPT_DIR}"
fi

# 3. Run from the tooling dir so the ESM `import "puppeteer-core"` resolves
#    against ~/.rw-site-audit/node_modules (NODE_PATH is ignored for ESM bare
#    specifiers). Copy in the current script each run so it always tracks the
#    repo version.
#    The repo lives under iCloud: if the file has been evicted to the cloud,
#    `cp` fails with errno 11 (EDEADLK) and the whole audit dies after crawling.
#    Force materialisation, retry, and fall back to last run's copy.
copied=""
for attempt in 1 2 3; do
  if cp -f "${SCRIPT_DIR}/site-audit.mjs" "${HOME_DIR}/site-audit.mjs" 2>/dev/null; then copied=ok; break; fi
  brctl download "${SCRIPT_DIR}/site-audit.mjs" 2>/dev/null || true
  sleep $((attempt * 10))
done
if [ -z "${copied}" ]; then
  [ -f "${HOME_DIR}/site-audit.mjs" ] || { echo "✗ site-audit.mjs недоступен (iCloud EDEADLK) и копии нет" >&2; exit 75; }
  echo "⚠ site-audit.mjs не скопирован (iCloud EDEADLK) — гоню копию прошлого прогона" >&2
fi

TS="$(date +%Y-%m-%d_%H%M)"
JSON="${REPORT_DIR}/audit_${TS}.json"
LOG="${REPORT_DIR}/audit_${TS}.log"

set +e
( cd "${HOME_DIR}" && node "${HOME_DIR}/site-audit.mjs" --json="${JSON}" "${PASS_ARGS[@]+"${PASS_ARGS[@]}"}" ) | tee "${LOG}"
CODE="${PIPESTATUS[0]}"
set -e

cp -f "${LOG}" "${REPORT_DIR}/latest.log"
[ -f "${JSON}" ] && cp -f "${JSON}" "${REPORT_DIR}/latest.json"

# Prune reports older than 60 days.
find "${REPORT_DIR}" -name 'audit_*' -mtime +60 -delete 2>/dev/null || true

# Notify on FAIL (only when asked, and only if osascript is present).
if [ "${NOTIFY}" = "1" ] && [ "${CODE}" != "0" ] && command -v osascript >/dev/null 2>&1; then
  FAILS="$(grep -c '^✗ FAIL' "${LOG}" 2>/dev/null || echo "?")"
  SUMMARY="$(grep -E '^✗ FAIL' "${LOG}" 2>/dev/null | sed 's/^✗ FAIL //' | head -3 | tr '\n' ',' | sed 's/,$//')"
  osascript -e "display notification \"${FAILS} FAIL: ${SUMMARY}\" with title \"Right Way site audit\" subtitle \"Регрессия на сайте\" sound name \"Basso\"" >/dev/null 2>&1 || true
fi

echo ""
echo "report: ${JSON}"
exit "${CODE}"
