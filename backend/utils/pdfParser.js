import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF.
 * @param {Buffer|string} input - Buffer of PDF bytes OR a local file path string
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPdf = async (input) => {
    try {
        const dataBuffer = Buffer.isBuffer(input)
            ? input
            : await fs.readFile(input);

        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data   = await parser.getText();

        return {
            text:     data.text,
            numPages: data.numPages,
            info:     data.info
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    }
};
