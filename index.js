const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { exit } = require('process');

async function main() {
  try {
    const [url, file] = process.argv.slice(2);

    if (!url) {
      throw new Error('Please provide a URL as the first argument.');
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('.easy-card-list');

    const boardTitle = await page.$eval('.board-name', (node) =>
      node.innerText.trim()
    );

    if (!boardTitle) {
      throw new Error('Board title does not exist. Please check if provided URL is correct.');
    }

    let parsedText = boardTitle + '\n\n';

    const columns = await page.$$('.easy-card-list');

    for (let i = 0; i < columns.length; i++) {
      const columnTitle = await columns[i].$eval('.column-header', (node) =>
        node.innerText.trim()
      );

      const messages = await columns[i].$$('.easy-board-front');
      if (messages.length) {
        parsedText += columnTitle + '\n';
      }
      for (let i = 0; i < messages.length; i++) {
        const messageText = await messages[i].$eval(
          '.easy-card-main .easy-card-main-content .text',
          (node) => node.innerText.trim()
        );
        const votes = await messages[i].$eval(
          '.easy-card-votes-container .easy-badge-votes',
          (node) => node.innerText.trim()
        );
        parsedText += `- ${messageText} (${votes})` + '\n';
      }

      if (messages.length) {
        parsedText += '\n';
      }
    }
    await writeToFile(file, parsedText);
  } catch (error) {
    console.error('An error occured: ', error.message);
  }
}

async function writeToFile(filePath, data) {
  const resolvedPath = path.resolve(
    filePath || `../${data.split("\n")[0].replace("/", "")}.txt`
  );
  fs.writeFile(resolvedPath, data, (error) => {
    if (error) {
      throw error;
    } else {
      console.log(`Successfully written to file at: ${resolvedPath}`);
    }
    process.exit();
  });
}

main();
