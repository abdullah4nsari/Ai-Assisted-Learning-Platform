import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from pdf file
 * @param {string} filepath - path to pdf file
 * @returns {Promise<{text: string, numPages:number}>}
 */

export const extractTextFromPdf = async (filepath)=>{
    try {
        const dataBuffer = await fs.readFile(filepath);
        //pdf-parse expects a unit8array not buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text:data.text,
            numPages:data.numPages,
            info:data.info
        };
    } catch (error) {
        console.error('PDF parsing error:', error); 
        throw new Error('Failed to extract text from PDF');
    }
}