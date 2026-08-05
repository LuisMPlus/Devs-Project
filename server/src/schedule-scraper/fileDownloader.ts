import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import { ScrapedCareerLink } from './types';

const DOWNLOAD_DIR = path.join(__dirname, '../../temp/downloads');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export function ensureDownloadDirectory(): string {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }
  return DOWNLOAD_DIR;
}

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_').toLowerCase();
}

export async function downloadFile(link: ScrapedCareerLink): Promise<{ filePath: string; fileType: 'xlsx' | 'pdf' }> {
  ensureDownloadDirectory();
  const safeName = sanitizeFileName(link.careerName);

  if (link.fileType === 'google_sheets') {
    const spreadsheetId = extractSpreadsheetId(link.url);
    if (!spreadsheetId) {
      throw new Error(`Failed to extract Google Sheets ID from URL: ${link.url}`);
    }

    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    const destinationPath = path.join(DOWNLOAD_DIR, `${safeName}_sem${link.semester}.xlsx`);

    console.log(`Downloading Google Sheet for "${link.careerName}" -> ${destinationPath}`);
    const response = await axios.get(exportUrl, { responseType: 'arraybuffer', httpsAgent });
    fs.writeFileSync(destinationPath, response.data);

    return { filePath: destinationPath, fileType: 'xlsx' };
  } else if (link.fileType === 'google_drive_pdf') {
    const fileId = extractDriveFileId(link.url);
    if (!fileId) {
      throw new Error(`Failed to extract Google Drive File ID from URL: ${link.url}`);
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const destinationPath = path.join(DOWNLOAD_DIR, `${safeName}_sem${link.semester}.pdf`);

    console.log(`Downloading Google Drive PDF for "${link.careerName}" -> ${destinationPath}`);
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer', httpsAgent });
    fs.writeFileSync(destinationPath, response.data);

    return { filePath: destinationPath, fileType: 'pdf' };
  }

  throw new Error(`Unsupported file type for link: ${link.url}`);
}
