# Гендер-пати — сайт-приглашение

Одностраничный сайт для Ольги и Николая Мужжериных. Статика: HTML, CSS, JavaScript.

## Локальный запуск

```bash
# Python
python -m http.server 8080

# или Node.js
npx serve .
```

Откройте http://localhost:8080

## Перед публикацией

1. **Виш-лист** — замените `WISHLIST_URL` в [`script.js`](script.js).
2. **Форма RSVP** — настройте Google Apps Script по инструкции в [`gas/README.md`](gas/README.md) и вставьте URL в `GAS_WEB_APP_URL`.
3. **Ассеты** — замените SVG-заглушки в `assets/images/` на PNG от художника (см. [`assets/TZ-hudozhniku.md`](assets/TZ-hudozhniku.md)).
4. **Карта** — при необходимости уточните точку в [Яндекс.Картах](https://yandex.ru/maps) и обновите iframe в `index.html`.

## GitHub Pages

Репозиторий: https://github.com/Feym4n/gender-party

**Включить публикацию (один раз):**

1. Откройте https://github.com/Feym4n/gender-party/settings/pages
2. **Build and deployment** → **Source**: `Deploy from a branch`
3. **Branch**: `master` → папка `/ (root)` → **Save**

Через 1–2 минуты сайт будет доступен по адресу:

**https://feym4n.github.io/gender-party/**

Файл `.nojekyll` уже добавлен — GitHub не будет игнорировать папки с подчёркиванием.

## Структура

```
index.html      — разметка
styles.css      — стили
script.js       — таймер, форма, конфиг
assets/         — изображения и шрифты
gas/            — скрипт для Google Таблицы
```
