# Google Sheets + Apps Script

## 1. Создать таблицу

1. Откройте [Google Таблицы](https://sheets.google.com) → создайте новую таблицу.
2. Переименуйте лист в `responses` (или оставьте — скрипт создаст лист сам).

## 2. Установить скрипт

1. **Расширения** → **Apps Script**.
2. Удалите содержимое `Code.gs` и вставьте код из [`Code.gs`](Code.gs).
3. Сохраните проект (Ctrl+S).

## 3. Опубликовать Web App

1. **Развернуть** → **Новое развёртывание**.
2. Тип: **Веб-приложение**.
3. **Запуск от имени:** Я (ваш аккаунт).
4. **У кого есть доступ:** Все.
5. Нажмите **Развернуть** и скопируйте **URL веб-приложения**.

## 4. Подключить к сайту

Вставьте URL в `script.js`:

```javascript
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/ВАШ_ID/exec';
```

## 5. Проверка

```bash
curl -X POST "ВАШ_URL" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Тест\",\"lastName\":\"Тестов\",\"attendance\":\"yes\",\"genderVote\":\"boy\"}"
```

Ожидаемый ответ: `{"ok":true}`

Повтор с теми же ФИО: `{"ok":false,"error":"already_voted"}`

## Структура листа responses

| timestamp | firstName | lastName | attendance | genderVote | fullNameKey |
|-----------|-----------|----------|------------|------------|-------------|
| auto | Иван | Петров | yes | boy | петров_иван |
