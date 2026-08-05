import { determineTargetSemester, scrapeScheduleLinks } from './webScraper';
import { downloadFile } from './fileDownloader';
import { parseExcelSchedule } from './parsers/sheetParser';
import { parsePdfSchedule } from './parsers/pdfParser';
import { mergeSchedulesIntoCareerJson } from './scheduleIntegrator';
import { RawScheduleEntry, SemesterOption } from './types';

async function main() {
  console.log('=== FI-UNJu Schedule Scraper & Integrator Module ===');

  const semesterArg = process.argv.find((arg) => arg.startsWith('--semester='));
  let semesterOption: SemesterOption = 'auto';

  if (semesterArg) {
    const val = semesterArg.split('=')[1].trim().toLowerCase();
    if (val === '1') semesterOption = 1;
    else if (val === '2') semesterOption = 2;
  }

  const targetSemester = determineTargetSemester(semesterOption);
  console.log(`Target Semester evaluated: Semester ${targetSemester} (Option chosen: '${semesterOption}')`);

  try {
    const scrapedLinks = await scrapeScheduleLinks(targetSemester);

    if (scrapedLinks.length === 0) {
      console.warn(`No schedule links found on FI-UNJu website for Semester ${targetSemester}.`);
      return;
    }

    let totalSchedulesParsed = 0;
    let totalFilesProcessed = 0;

    for (const link of scrapedLinks) {
      console.log(`\n--- Processing: ${link.careerName} (${link.url}) ---`);

      try {
        const downloadResult = await downloadFile(link);
        let rawEntries: RawScheduleEntry[] = [];

        if (downloadResult.fileType === 'xlsx') {
          rawEntries = parseExcelSchedule(downloadResult.filePath, link.careerName);
        } else if (downloadResult.fileType === 'pdf') {
          rawEntries = await parsePdfSchedule(downloadResult.filePath, link.careerName);
        }

        if (rawEntries.length > 0) {
          const integrationResult = mergeSchedulesIntoCareerJson(link.careerName, rawEntries);
          totalSchedulesParsed += rawEntries.length;
          totalFilesProcessed++;
          console.log(` Successfully integrated ${rawEntries.length} schedule entries into ${integrationResult.targetSchedulesFile}`);
        } else {
          console.warn(`⚠️ No valid schedule entries parsed from file: ${downloadResult.filePath}`);
        }
      } catch (err: any) {
        console.error(`❌ Error processing link "${link.careerName}":`, err.message || err);
      }
    }

    console.log('\n===================================================');
    console.log(' FI-UNJu Schedule Scraping & Integration Finished!');
    console.log(` Total Files Processed: ${totalFilesProcessed}`);
    console.log(` Total Schedule Entries Parsed: ${totalSchedulesParsed}`);
    console.log('===================================================');
  } catch (error: any) {
    console.error('❌ Fatal error during schedule scraping:', error.message || error);
    process.exit(1);
  }
}

main();
