/**
 * Google Apps Script для RSVP и голосования.
 * Привязать к Google Таблице: Расширения → Apps Script.
 */

var SHEET_NAME = 'responses';
var STATS_SHEET_NAME = 'Статистика';

// Русские заголовки — только для отображения, логика работает по номерам столбцов
var HEADERS = [
  'Дата и время',
  'Имя',
  'Фамилия',
  'Придёт?',
  'Прогноз',
  'Служебный ключ'
];

var COL_FULL_NAME_KEY = 6;

function doPost(e) {
  try {
    var data = parseRequest_(e);
    var errors = validate_(data);

    if (errors.length > 0) {
      return jsonResponse_({ ok: false, error: 'validation', messages: errors });
    }

    var fullNameKey = makeFullNameKey_(data.lastName, data.firstName);
    var sheet = getSheet_();

    if (findDuplicate_(sheet, fullNameKey)) {
      return jsonResponse_({ ok: false, error: 'already_voted' });
    }

    sheet.appendRow([
      new Date(),
      data.firstName,
      data.lastName,
      formatAttendance_(data.attendance),
      formatGenderVote_(data.genderVote),
      fullNameKey
    ]);

    // Диаграмма не должна ломать ответ форме, если запись уже сохранена
    try {
      updateStatsChart_();
    } catch (chartErr) {
      Logger.log('updateStatsChart_: ' + chartErr);
    }

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'server', message: String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, status: 'ready' });
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body');
  }

  return JSON.parse(e.postData.contents);
}

function validate_(data) {
  var errors = [];

  if (!data.firstName || !String(data.firstName).trim()) {
    errors.push('firstName required');
  }
  if (!data.lastName || !String(data.lastName).trim()) {
    errors.push('lastName required');
  }
  if (data.attendance !== 'yes' && data.attendance !== 'no') {
    errors.push('attendance invalid');
  }
  if (data.genderVote !== 'boy' && data.genderVote !== 'girl') {
    errors.push('genderVote invalid');
  }

  return errors;
}

function formatAttendance_(value) {
  return value === 'yes' ? 'Да' : 'Нет';
}

function formatGenderVote_(value) {
  return value === 'boy' ? 'Мальчик' : 'Девочка';
}

function makeFullNameKey_(lastName, firstName) {
  return String(lastName).trim().toLowerCase() + '_' + String(firstName).trim().toLowerCase();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.hideColumns(COL_FULL_NAME_KEY);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.hideColumns(COL_FULL_NAME_KEY);
  }

  return sheet;
}

function findDuplicate_(sheet, fullNameKey) {
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  var keys = sheet.getRange(2, COL_FULL_NAME_KEY, lastRow, COL_FULL_NAME_KEY).getValues();

  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i][0]) === fullNameKey) {
      return true;
    }
  }

  return false;
}

function countVotes_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var boys = 0;
  var girls = 0;

  if (!sheet || sheet.getLastRow() < 2) {
    return { boys: 0, girls: 0 };
  }

  var votes = sheet.getRange(2, 5, sheet.getLastRow(), 5).getValues();

  for (var i = 0; i < votes.length; i++) {
    var vote = String(votes[i][0]).toLowerCase();

    if (vote === 'boy' || vote === 'мальчик') {
      boys++;
    } else if (vote === 'girl' || vote === 'девочка') {
      girls++;
    }
  }

  return { boys: boys, girls: girls };
}

function updateStatsChart_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var statsSheet = ss.getSheetByName(STATS_SHEET_NAME);

  if (!statsSheet) {
    statsSheet = ss.insertSheet(STATS_SHEET_NAME);
  }

  statsSheet.clear();
  statsSheet.getRange('A1:B1').setValues([['Прогноз', 'Голосов']]).setFontWeight('bold');

  var counts = countVotes_();
  statsSheet.getRange('A2:B3').setValues([
    ['Мальчик', counts.boys],
    ['Девочка', counts.girls]
  ]);

  statsSheet.getRange('B2:B3').setNumberFormat('0');

  var existingCharts = statsSheet.getCharts();
  for (var i = 0; i < existingCharts.length; i++) {
    statsSheet.removeChart(existingCharts[i]);
  }

  if (counts.boys + counts.girls === 0) {
    statsSheet.getRange('A5').setValue('Пока нет голосов — диаграмма появится после первых ответов.');
    return;
  }

  var chart = statsSheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(statsSheet.getRange('A2:B3'))
    .setPosition(4, 0, 0, 0)
    .setOption('title', 'Соотношение прогнозов')
    .setOption('legend', { position: 'bottom' })
    .setOption('pieSliceText', 'percentage')
    .setOption('colors', ['#6FA8DC', '#F4A6C1'])
    .setOption('width', 480)
    .setOption('height', 320)
    .build();

  statsSheet.insertChart(chart);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
