import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

const PROGRAMA_MATERIAS_URL = 'https://www.fi.unju.edu.ar/programa-materias.html';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export function normalizeSubjectNameKey(str: string): string {
  return str
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function scrapeSyllabusLinks(): Promise<Map<string, string>> {
  console.log(`Fetching syllabus page from ${PROGRAMA_MATERIAS_URL}...`);
  const response = await axios.get(PROGRAMA_MATERIAS_URL, {
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.data);
  const syllabusMap = new Map<string, string>();

  $('table tbody tr').each((_, element) => {
    const $tr = $(element);
    const $link = $tr.find('td').first().find('a');
    if ($link.length > 0) {
      const subjectName = $link.text().trim().replace(/\s+/g, ' ');
      const href = $link.attr('href')?.trim();

      if (subjectName && href && href.includes('drive.google.com')) {
        const key = normalizeSubjectNameKey(subjectName);
        syllabusMap.set(key, href);
      }
    }
  });

  console.log(`Scraped ${syllabusMap.size} syllabus drive links from programa-materias.html.`);
  return syllabusMap;
}
