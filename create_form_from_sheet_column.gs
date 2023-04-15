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

  // Remove all existing items
  const items = form.getItems();
  for (let i = 0; i < items.length; i++) {
    form.deleteItem(items[i]);
  }

  // Add Section 1
  form.addTextItem()
    .setTitle('What language do you want to add?');

  form.addTextItem()
    .setTitle('Github username (to credit you in the repository)');

  // Add Section 2
  form.addSectionHeaderItem()
    .setTitle('Translate these texts into your language:')
    .setHelpText('Mind variables before or after the text for your translation.');

  // Add paragraph text items for each data item in the column
  columnData.forEach(text => {
    form.addParagraphTextItem()
      .setTitle(('"' + text + '"'))
      .setRequired(true);
  });
}
