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

1. Создайте репозиторий на GitHub.
2. Загрузите файлы в корень (или в папку `docs/`).
3. **Settings** → **Pages** → Source: ветка `main`, папка `/ (root)` или `/docs`.
4. Сайт будет доступен по адресу `https://<username>.github.io/<repo>/`.

Файл `.nojekyll` уже добавлен — GitHub не будет игнорировать папки с подчёркиванием.

## Структура

```
index.html      — разметка
styles.css      — стили
script.js       — таймер, форма, конфиг
assets/         — изображения и шрифты
gas/            — скрипт для Google Таблицы
```
