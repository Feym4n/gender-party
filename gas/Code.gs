/**
 * Google Apps Script для RSVP и голосования.
 * Привязать к Google Таблице: Расширения → Apps Script.
 */

var SHEET_NAME = 'responses';

var HEADERS = [
  'timestamp',
  'firstName',
  'lastName',
  'attendance',
  'genderVote',
  'fullNameKey'
];

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
      data.attendance,
      data.genderVote,
      fullNameKey
    ]);

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
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function findDuplicate_(sheet, fullNameKey) {
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  var keys = sheet.getRange(2, 6, lastRow, 6).getValues();

  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i][0]) === fullNameKey) {
      return true;
    }
  }

  return false;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
