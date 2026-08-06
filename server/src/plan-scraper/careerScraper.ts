import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

const HOME_URL = 'https://www.fi.unju.edu.ar/';
const BASE_DOMAIN = 'https://www.fi.unju.edu.ar';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ScrapedSubject {
  cod: number | string;
  name: string;
  year: number | null | string;
  semester: 1 | 2 | null;
  prerequisites: (number | string)[];
  classroomUrl: string;
  syllabusUrl: string | null;
  isOfferedBothSemesters: boolean;
  groupLink: string | null;
  drive: string;
  type: 'mandatory' | 'optional' | 'requirement';
  description: string;
}

export interface ScrapedCareerPlan {
  careerTitle: string;
  careerUrl: string;
  subjects: ScrapedSubject[];
}

export async function scrapeCareerLinks(): Promise<{ title: string; url: string }[]> {
  console.log(`Fetching FI-UNJu home page: ${HOME_URL}`);
  const response = await axios.get(HOME_URL, {
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.data);
  const careerLinks: { title: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  $('a[href*="/carreras/perfil-alcance/"]').each((_, el) => {
    const $link = $(el);
    const text = $link.text().trim().replace(/\s+/g, ' ');
    let href = $link.attr('href')?.trim();

    if (!href || !text) return;
    if (href.startsWith('/')) {
      href = BASE_DOMAIN + href;
    }

    if (!seenUrls.has(href)) {
      seenUrls.add(href);
      careerLinks.push({ title: text, url: href });
    }
  });

  console.log(`Discovered ${careerLinks.length} career profile links.`);
  return careerLinks;
}

export async function scrapeSingleCareerPlan(careerUrl: string, careerTitle: string): Promise<ScrapedCareerPlan> {
  console.log(`Scraping Plan de Estudio for "${careerTitle}" -> ${careerUrl}`);
  const response = await axios.get(careerUrl, {
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.data);
  const subjects: ScrapedSubject[] = [];

  let currentYear: number | null = 1;

  $('table tbody tr').each((_, el) => {
    const $tr = $(el);
    const $th = $tr.find('th');
    const $tds = $tr.find('td');

    // Check year header row e.g. "PRIMER AÑO", "SEGUNDO AÑO", "TERCER AÑO"
    const headerText = $tr.text().toUpperCase();
    if (headerText.includes('PRIMER AÑO') || headerText.includes('1° AÑO') || headerText.includes('1ER AÑO')) currentYear = 1;
    else if (headerText.includes('SEGUNDO AÑO') || headerText.includes('2° AÑO') || headerText.includes('2DO AÑO')) currentYear = 2;
    else if (headerText.includes('TERCER AÑO') || headerText.includes('3° AÑO') || headerText.includes('3ER AÑO')) currentYear = 3;
    else if (headerText.includes('CUARTO AÑO') || headerText.includes('4° AÑO') || headerText.includes('4TO AÑO')) currentYear = 4;
    else if (headerText.includes('QUINTO AÑO') || headerText.includes('5° AÑO') || headerText.includes('5TO AÑO')) currentYear = 5;

    if ($tds.length >= 2) {
      const rawCod = $th.first().text().trim() || String(subjects.length + 1);

      const firstTdText = $tds.eq(0).text().trim();
      const hasExplicitYearCol = /^(\d+)[°º]/.test(firstTdText);

      let rowYear = currentYear;
      let name = '';
      let rawSemester = '';
      let rawPrereqs = '';

      if (hasExplicitYearCol) {
        const matchYear = firstTdText.match(/^(\d+)/);
        if (matchYear) rowYear = parseInt(matchYear[1], 10);
        name = $tds.eq(1).text().trim().replace(/\s+/g, ' ');
        rawSemester = $tds.length >= 3 ? $tds.eq(2).text().trim().toLowerCase() : '';
        rawPrereqs = $tds.length >= 4 ? $tds.eq(3).text().trim() : '';
      } else {
        name = $tds.eq(0).text().trim().replace(/\s+/g, ' ');
        rawSemester = $tds.length >= 2 ? $tds.eq(1).text().trim().toLowerCase() : '';
        rawPrereqs = $tds.length >= 3 ? $tds.eq(2).text().trim() : '';
      }

      if (!name || name.toUpperCase().includes('ASIGNATURA') || name.toUpperCase().includes('MATERIA')) {
        return;
      }

      let semester: 1 | 2 | null = null;
      if (rawSemester.includes('1') || rawSemester.includes('1er')) semester = 1;
      else if (rawSemester.includes('2') || rawSemester.includes('2do')) semester = 2;

      const prerequisites: (number | string)[] = [];
      if (rawPrereqs) {
        const matches = rawPrereqs.match(/\d+/g);
        if (matches) {
          matches.forEach((m) => prerequisites.push(parseInt(m, 10)));
        }
      }

      // Extract Aula Virtual & Drive/Syllabus links
      let classroomUrl = '';
      let syllabusUrl: string | null = null;

      $tr.find('a').each((_, aEl) => {
        const aHref = $(aEl).attr('href')?.trim() || '';
        const aText = $(aEl).text().toLowerCase();

        if (aHref.includes('virtual.unju.edu.ar')) {
          classroomUrl = aHref;
        } else if (aHref.includes('drive.google.com') || aText.includes('ver link') || aText.includes('programa')) {
          syllabusUrl = aHref;
        }
      });

      const isOptional =
        name.toLowerCase().includes('optativ') ||
        name.toLowerCase().includes('electiv') ||
        name.toLowerCase().includes('curso opt') ||
        name.toLowerCase().includes('materia opt');

      subjects.push({
        cod: isNaN(Number(rawCod)) ? rawCod : Number(rawCod),
        name,
        year: rowYear,
        semester,
        prerequisites,
        classroomUrl,
        syllabusUrl,
        isOfferedBothSemesters: false,
        groupLink: null,
        drive: '',
        type: isOptional ? 'optional' : 'mandatory',
        description: '',
      });
    }
  });

  console.log(` Parsed ${subjects.length} subjects for "${careerTitle}".`);
  return {
    careerTitle,
    careerUrl,
    subjects,
  };
}
