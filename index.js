const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');
const { exit } = require('process');

async function main() {
    try {
        const [url, file] = process.argv.slice(2);

        if (!url) {
            throw new Error('Please provide a URL as the first argument.');
        }

        const parsedText = await fetchBoardContent(url);

        const resolvedPath = getResolvedPath(file,parsedText)
        await writeToFile(resolvedPath, parsedText);

    } catch (error) {
        console.error('An error occured: ', error.message);
    }
}

async function writeToFile(resolvedPath, parsedText) {
    try {
        await fs.writeFile(resolvedPath, parsedText);
        console.log(`Successfully written to file at: ${resolvedPath}`);
    } catch (error) {
        console.error('Error found while writing to file: ', error.message)
    }
    process.exit();
}

async function fetchBoardContent(url){
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

    return parsedText;
}

function getResolvedPath(filePath, parsedText){
    return path.resolve(
        filePath || `../${parsedText.split("\n")[0].replace("/", "")}.txt`
      );
}

main();
