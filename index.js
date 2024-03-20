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

        const [parsedText, boardTitleForFilename] = await fetchBoardContent(url);

        const resolvedPath = getResolvedPath(boardTitleForFilename, 'csv')
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

async function fetchBoardContent(url) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url);
        await page.waitForSelector('.easy-card-list');

        const boardTitle = await getBoardTitle(page);
        if (!boardTitle) {
            throw new Error('Board title does not exist. Please check if provided URL is correct.');
        }

        const columns = await getColumns(page);

        const parsedText = await parseColumns(boardTitle, columns);
        return [parsedText, boardTitle];
    } catch (error) {
        console.error('An error occurred while fetching board content:', error);
        throw error;
    }
}

async function getBoardTitle(page) {
    return await page.$eval('.board-name', (node) => node.innerText.trim());
}

async function getColumns(page) {
    return await page.$$('.easy-card-list');
}

async function parseColumns(boardTitle, columns) {
    let parsedText = '';

    const columnHeadersPromises = columns.map(async (column) => await getColumnTitle(column));
    const columnHeaders = await Promise.all(columnHeadersPromises);
    parsedText += columnHeaders.join(',') + '\n';


    for (let i = 0; i < columns.length; i++) {
        const messages = await getMessages(columns[i]);
        parsedText += await parseMessages(messages)
        parsedText += '\n';
    }

    return parsedText;
}

async function parseMessages( messages) {
  let parsedText = '';
  for (let i = 0; i < messages.length; i++) {
      const messageText = await getMessageText(messages[i]);
      const votes = await getMessageVotes(messages[i]);
      parsedText += (parseInt(votes) > 0) ? `${messageText},`:','; 
      
  }
  parsedText += '\n';
  return parsedText;
}


async function getColumnTitle(column) {
    return column.$eval('.column-header', (node) => node.innerText.trim());
}

async function getMessages(column) {
    return await column.$$('.easy-board-front');
}

function getMessageText(message) {
    return message.$eval('.easy-card-main .easy-card-main-content .text', (node) => node.innerText.trim());
}

function getMessageVotes(message) {
    return message.$eval('.easy-card-votes-container .easy-badge-votes', (node) => node.innerText.trim());
}

function getResolvedPath(filePath, extension) {

    const boardTitle = filePath ? filePath.replace(/\s+/g, '') : 'default-board-name';
    return path.resolve(`${boardTitle}.${extension}`);

}

main();
