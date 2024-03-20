import { getResolvedPath, writeToFile } from './utils/fileUtils.js';
import { fetchBoardContent } from './utils/boardWebScrapping.js';

async function main() {
    try {
        const [url] = process.argv.slice(2);

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

main();
