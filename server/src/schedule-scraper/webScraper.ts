import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';
import { ScrapedCareerLink, SemesterOption } from './types';

const TARGET_URL = 'https://www.fi.unju.edu.ar/horarios-fiunju.html';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export function determineTargetSemester(option: SemesterOption = 'auto'): 1 | 2 {
  if (option === 1 || option === 2) {
    return option;
  }
  const currentMonth = new Date().getMonth() + 1; // 1 to 12
  // January (1) to July (7) -> 1st Semester
  // August (8) to December (12) -> 2nd Semester
  return currentMonth >= 8 ? 2 : 1;
}

export async function scrapeScheduleLinks(targetSemester: 1 | 2): Promise<ScrapedCareerLink[]> {
  console.log(`Fetching schedule page from ${TARGET_URL}...`);
  const response = await axios.get(TARGET_URL, {
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.data);
  const tabPaneId = targetSemester === 1 ? '#1-tab-pane' : '#2-tab-pane';
  const $tabPane = $(tabPaneId);

  if ($tabPane.length === 0) {
    throw new Error(`Could not find tab pane with ID '${tabPaneId}' on page.`);
  }

  const scrapedLinks: ScrapedCareerLink[] = [];

  $tabPane.find('a').each((_, element) => {
    const $link = $(element);
    const href = $link.attr('href')?.trim();
    const text = $link.text().trim().replace(/\s+/g, ' ');

    if (!href || !text || text.includes('Aulas Virtuales') || text.includes('SIU GUARANÍ')) {
      return;
    }

    let fileType: 'google_sheets' | 'google_drive_pdf' | 'other' | null = null;
    if (href.includes('docs.google.com/spreadsheets')) {
      fileType = 'google_sheets';
    } else if (href.includes('drive.google.com/file')) {
      fileType = 'google_drive_pdf';
    }

    if (fileType) {
      // Try to find closest category heading
      const category = $link.closest('.row').prevAll('h4').first().text().trim() || 'General';

      scrapedLinks.push({
        careerName: text,
        url: href,
        fileType,
        semester: targetSemester,
        category,
      });
    }
  });

  console.log(`Scraped ${scrapedLinks.length} schedule links for Semester ${targetSemester}.`);
  return scrapedLinks;
}
