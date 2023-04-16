// This script creates a Google Form from data in a specified column of a Google Sheet.
// The form is used to collect new translations for https://github.com/n3d1117/chatgpt-telegram-bot.
// The script first clears any existing form items, then adds two sections:
// 1. A section for the user to specify the language they want to add and their GitHub username.
// 2. A section where the user can provide translations for the texts in the specified column of the Google Sheet.

function main() {
  updateFormFromColumn(2);
}

// Fetches data from a specified column in the Google Sheet and creates a form with that data.
function updateFormFromColumn(columnIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const numRows = sheet.getLastRow() - 1;

  if (numRows <= 0) {
    Logger.log('No data found in the sheet. Please make sure there are rows in the specified column.');
    return;
  }

  const columnData = sheet.getRange(2, columnIndex, numRows).getValues().flat();
  createForm(columnData);
}

// Creates a form with the given column data.
function createForm(columnData) {
  const formId = '1FvSTLI2COtAV7Ti14M5fKdgieNeBuiwu6bJEvxbiA9Y';
  const form = FormApp.openById(formId);

  const items = form.getItems();
  let position = 0;

  // Update Section 1 items
  updateOrCreateTextItem(form, items, position++, 'What language do you want to add?');
  updateOrCreateTextItem(form, items, position++, 'Github username (to credit you in the repository)');

  // Update Section 2 header item
  updateOrCreateSectionHeaderItem(form, items, position++, 'Translate these texts into your language:', 'Mind variables before or after the text for your translation.');

  // Update translation items
  columnData.forEach(text => {
    updateOrCreateParagraphTextItem(form, items, position++, '"' + text + '"', true);
  });

  // Remove any extra items
  while (position < form.getItems().length) {
    form.deleteItem(form.getItems()[position]);
  }
}

function updateOrCreateTextItem(form, items, position, title) {
  if (position < items.length && items[position].getType() === FormApp.ItemType.TEXT) {
    items[position].asTextItem().setTitle(title);
  } else {
    form.addTextItem().setTitle(title);
  }
}

function updateOrCreateSectionHeaderItem(form, items, position, title, helpText) {
  if (position < items.length && items[position].getType() === FormApp.ItemType.SECTION_HEADER) {
    items[position].asSectionHeaderItem().setTitle(title).setHelpText(helpText);
  } else {
    form.addSectionHeaderItem().setTitle(title).setHelpText(helpText);
  }
}

function updateOrCreateParagraphTextItem(form, items, position, title, required) {
  if (position < items.length && items[position].getType() === FormApp.ItemType.PARAGRAPH_TEXT) {
    items[position].asParagraphTextItem().setTitle(title).setRequired(required);
  } else {
    form.addParagraphTextItem().setTitle(title).setRequired(required);
  }
}
