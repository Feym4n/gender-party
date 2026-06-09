/* eslint-disable no-unused-vars */
const CONFIG = {
  EVENT_ISO: '2026-06-16T15:00:00+03:00',
  RSVP_DEADLINE: '2026-06-01',
  WISHLIST_URL: 'https://ohmywishes.ru/users/8467213ad77f80f827245339/lists/376a1dae1d35c87673557284',
  // URL из «Развернуть → Веб-приложение», формат: .../macros/s/XXXX/exec
  // НЕ ссылка на редактор script.google.com/.../edit
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwpQxvlBBD00x1WpmIO6elZ9EVXeHKA_Uz6eFRYUz2XJgmMrn-TfwVN0uoQYm01-Q5HZQ/exec'
};

const STORAGE_KEY = 'gp_rsvp_submitted';

function pad(n) {
  return String(n).padStart(2, '0');
}

function makeFullNameKey(lastName, firstName) {
  return `${String(lastName).trim().toLowerCase()}_${String(firstName).trim().toLowerCase()}`;
}

function initWishlist() {
  const link = document.getElementById('wishlist-link');
  if (!link) return;

  if (CONFIG.WISHLIST_URL && CONFIG.WISHLIST_URL !== 'https://example.com/wishlist') {
    link.href = CONFIG.WISHLIST_URL;
  } else {
    link.addEventListener('click', (e) => {
      e.preventDefault();
    });
    link.title = 'Ссылка будет добавлена позже';
  }
}

function initRsvpDeadline() {
  const el = document.getElementById('rsvp-deadline');
  if (!el || !CONFIG.RSVP_DEADLINE) return; // нет на варианте с макетом-подложкой

  const date = new Date(CONFIG.RSVP_DEADLINE + 'T23:59:59+03:00');
  const formatted = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  el.textContent = `Пожалуйста, подтвердите присутствие до ${formatted}.`;
}

function updateCountdown() {
  const eventDate = new Date(CONFIG.EVENT_ISO);
  const diff = eventDate - Date.now();

  const countdownEl = document.getElementById('countdown');
  const doneEl = document.getElementById('countdown-done');

  if (diff <= 0) {
    if (countdownEl) countdownEl.classList.add('hidden');
    if (doneEl) doneEl.classList.remove('hidden');
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (daysEl) daysEl.textContent = pad(days);
  if (hoursEl) hoursEl.textContent = pad(hours);
  if (minutesEl) minutesEl.textContent = pad(minutes);
  if (secondsEl) secondsEl.textContent = pad(seconds);
}

function showFormMessage(text, type) {
  const el = document.getElementById('form-message');
  if (!el) return;

  el.textContent = text;
  el.className = `form-message form-message--${type}`;
  el.classList.remove('hidden');
}

function hideFormMessage() {
  const el = document.getElementById('form-message');
  if (el) el.classList.add('hidden');
}

function getFormData(form) {
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const attendance = form.querySelector('input[name="attendance"]:checked');
  const genderVote = form.querySelector('input[name="genderVote"]:checked');

  return {
    firstName,
    lastName,
    attendance: attendance ? attendance.value : '',
    genderVote: genderVote ? genderVote.value : ''
  };
}

function validateFormData(data) {
  if (!data.firstName) return 'Введите имя.';
  if (!data.lastName) return 'Введите фамилию.';
  if (!data.attendance) return 'Укажите, придёте ли вы.';
  if (!data.genderVote) return 'Выберите прогноз: мальчик или девочка.';
  return null;
}

function isValidGasUrl(url) {
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url);
}

async function submitRsvp(data) {
  const url = CONFIG.GAS_WEB_APP_URL;

  if (!url) {
    throw new Error('not_configured');
  }

  if (!isValidGasUrl(url)) {
    throw new Error('bad_url');
  }

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });

  if (response.status === 403) {
    throw new Error('access_denied');
  }

  return parseGasResponse_(response);
}

async function parseGasResponse_(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  }

  // Google Apps Script иногда отвечает редиректом, хотя запись уже прошла
  if (response.ok || response.status === 0) {
    return { ok: true };
  }

  throw new Error('network');
}

function initForm() {
  const form = document.getElementById('rsvp-form');
  const submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    showFormMessage('Вы уже отправляли ответ с этого устройства. Спасибо!', 'info');
    submitBtn.disabled = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormMessage();

    const data = getFormData(form);
    const validationError = validateFormData(data);

    if (validationError) {
      showFormMessage(validationError, 'error');
      return;
    }

    const fullNameKey = makeFullNameKey(data.lastName, data.firstName);

    if (localStorage.getItem(STORAGE_KEY) === fullNameKey) {
      showFormMessage('Вы уже отправляли ответ.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

    try {
      const result = await submitRsvp(data);

      if (result.ok) {
        localStorage.setItem(STORAGE_KEY, fullNameKey);
        showFormMessage('Спасибо! Ваш ответ записан.', 'success');
        form.reset();
      } else if (result.error === 'already_voted') {
        localStorage.setItem(STORAGE_KEY, fullNameKey);
        showFormMessage('Ответ с таким именем и фамилией уже был отправлен.', 'error');
      } else {
        showFormMessage('Не удалось отправить. Попробуйте позже.', 'error');
        submitBtn.disabled = false;
      }
    } catch (err) {
      if (err.message === 'not_configured') {
        showFormMessage(
          'Форма ещё не подключена. Укажите GAS_WEB_APP_URL в script.js.',
          'info'
        );
      } else if (err.message === 'bad_url') {
        showFormMessage(
          'Неверный адрес таблицы. Нужен URL из «Развернуть → Веб-приложение» (…/macros/s/…/exec), не ссылка на редактор.',
          'error'
        );
      } else if (err.message === 'access_denied') {
        showFormMessage(
          'Доступ закрыт (403). В Apps Script: Развернуть → Управление → изменить → «У кого есть доступ» = «Все», не «Только я».',
          'error'
        );
      } else {
        showFormMessage(
          'Не удалось отправить. Проверьте интернет и настройки развёртывания веб-приложения.',
          'error'
        );
      }
      submitBtn.disabled = false;
    }

    submitBtn.textContent = 'Отправить';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initWishlist();
  initRsvpDeadline();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initForm();
});
