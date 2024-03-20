import fs from 'fs/promises';
import path from 'path';

export async function writeToFile(resolvedPath, parsedText) {
    try {
        await fs.writeFile(resolvedPath, parsedText);
        console.log(`Successfully written to file at: ${resolvedPath}`);
    } catch (error) {
        console.error('Error found while writing to file: ', error.message)
    }
    process.exit();
}

export function getResolvedPath(filePath, extension) {

    const boardTitle = filePath ? filePath.replace(/\s+/g, '') : 'default-board-name';
    return path.resolve(`./output-files/${boardTitle}.${extension}`);

}