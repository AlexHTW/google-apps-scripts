/**
 * This script imports JSON data containing translations from the translations file of 
 * https://github.com/n3d1117/chatgpt-telegram-bot into a Google Sheet.
 * It organizes the data by country codes (languages) as columns and translation keys as rows.
 * The first row contains the header with the language codes and the word "key" for the first column.
 * Formatting is applied to the sheet, including alternating colors for better readability,
 * making the header row bold, adding a right border to the first column, and setting the first column text in italics.
 * Empty rows and columns are removed.
 * The script can be set to run at a specified interval to update the sheet with the latest translation data.
 */

// Define color constants f
const colorA = '#9EC6E8';
const lightColorA = '#D0E8F2';
const colorB = '#9ED6C0';
const lightColorB = '#D0F0E8';

function importJSON() {
  try {
    var url = "https://raw.githubusercontent.com/n3d1117/chatgpt-telegram-bot/main/translations.json";
    const json = fetchJsonFromUrl(url);
    const data = prepareData(json);
    const sheet = getFirstSheet();
    clearSheet(sheet);
    writeDataToSheet(sheet, data);
    applyFormatting(sheet, data);
    removeEmptyRows(sheet, data);
  } catch (error) {
    Logger.log(`Error: ${error}`);
  }
}

function fetchJsonFromUrl(url) {
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText();
  return JSON.parse(content);
}

function prepareData(json) {
  const keys = new Set();
  const languages = Object.keys(json);

  // Add all unique keys from both languages
  languages.forEach(lang => {
    Object.keys(json[lang]).forEach(key => {
      keys.add(key);
    });
  });

  // Prepare the rowData array
  const rowData = [];
  Array.from(keys).forEach(key => {
    const rowValues = languages.map(lang => json[lang][key] || '');
    const isArrayValues = rowValues.some(value => Array.isArray(value));

    if (isArrayValues) {
      const maxLength = rowValues.reduce((max, value) => Math.max(max, Array.isArray(value) ? value.length : 0), 0);
      for (let i = 0; i < maxLength; i++) {
        rowData.push([
          `${key} [${i}]`,
          ...rowValues.map(value => (Array.isArray(value) && value[i] !== undefined ? value[i] : '')),
        ]);
      }
    } else {
      rowData.push([key, ...rowValues]);
    }
  });

  return { languages, rowData };
}

function getFirstSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function clearSheet(sheet) {
  sheet.clear();
  sheet.clearFormats();
}

function writeDataToSheet(sheet, data) {
  sheet.getRange(1, 1, 1, data.languages.length + 1).setValues([['key', ...data.languages]]);
  sheet.getRange(2, 1, data.rowData.length, data.rowData[0].length).setValues(data.rowData);
}

function applyFormatting(sheet, data) {
  applyHeaderFormatting(sheet, data.languages.length);
  applyFirstColumnFormatting(sheet, data.rowData.length + 1);
  applyAlternatingColors(sheet, data.rowData.length + 1, data.languages.length);
}

function applyHeaderFormatting(sheet, numCols) {
  const range = sheet.getRange(1, 1, 1, numCols + 1);
  range.setFontWeight('bold');
  range.setBorder(null, null, true, null, null, null, null, SpreadsheetApp.BorderStyle.SOLID);
}

function applyFirstColumnFormatting(sheet, numRows) {
  sheet.getRange(1, 1, numRows, 1).setFontStyle('italic');
  sheet.getRange(1, 1, numRows, 1).setBorder(null, null, null, true, null, null, null, SpreadsheetApp.BorderStyle.SOLID);
}

function getColorForRowAndColumn(row, col) {
  if (row % 2 === 0) {
    return col % 2 === 0 ? lightColorA : lightColorB;
  } else {
    return col % 2 === 0 ? colorA : colorB;
  }
}

function applyAlternatingColors(sheet, numRows, numCols) {
  const range = sheet.getRange(1, 1, numRows, numCols + 1);
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols + 1; col++) {
      const color = getColorForRowAndColumn(row, col);
      range.getCell(row, col).setBackground(color);
    }
  }
}

function removeEmptyRows(sheet, data) {
  const maxRows = sheet.getMaxRows();
  const extraRows = maxRows - (data.rowData.length + 1);
  if (extraRows > 0) {
    sheet.deleteRows(data.rowData.length + 2, extraRows);
  }
}