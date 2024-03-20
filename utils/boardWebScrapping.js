import { chromium } from 'playwright';

export async function fetchBoardContent(url) {
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

  const columnMessagesPromises = columns.map(async (column) => await parseMessages(await getMessages(column)));
  const columnMessages = await Promise.all(columnMessagesPromises);

  const maxRowCount = Math.max(...columnMessages.map(messages => messages.length));

  for (let i = 0; i < maxRowCount; i++) {
      const rowValues = columns.map((_, index) => {
          const message = columnMessages[index][i];
          return message ? message : '';
      }).join(',');
      parsedText += `${rowValues}\n`;
  }

  return parsedText;
}



async function parseMessages(messages) {
  let parsedText = [];
  for (let i = 0; i < messages.length; i++) {
      const messageText = await getMessageText(messages[i]);
      const votes = await getMessageVotes(messages[i]);
      if (parseInt(votes) > 0) {
          parsedText.push(messageText);
      }else{
        parsedText.push('');
      }
  }
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