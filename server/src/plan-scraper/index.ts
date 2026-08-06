import { scrapeSyllabusLinks } from './syllabusScraper';
import { scrapeCareerLinks, scrapeSingleCareerPlan, ScrapedCareerPlan } from './careerScraper';
import { integrateSyllabusAndCareerPlans } from './planIntegrator';

async function main() {
  console.log('=== FI-UNJu Career Study Plans & Syllabus Scraper ===');

  try {
    // 1. Scrape syllabus drive links from programa-materias.html
    const syllabusMap = await scrapeSyllabusLinks();

    // 2. Discover all career links from home page
    const careerLinks = await scrapeCareerLinks();

    const scrapedPlans: ScrapedCareerPlan[] = [];

    // 3. Scrape study plans for each career profile page
    for (const link of careerLinks) {
      try {
        const plan = await scrapeSingleCareerPlan(link.url, link.title);
        if (plan.subjects.length > 0) {
          scrapedPlans.push(plan);
        } else {
          console.warn(`⚠️ No subjects found on career page: ${link.url}`);
        }
      } catch (err: any) {
        console.error(`❌ Error scraping career "${link.title}":`, err.message || err);
      }
    }

    // 4. Clean subjects directory and integrate syllabusUrl & new career plan JSONs
    integrateSyllabusAndCareerPlans(scrapedPlans, syllabusMap);

    console.log('\n===================================================');
    console.log(' FI-UNJu Study Plans & Syllabus Integration Finished!');
    console.log(` Total Careers Processed: ${scrapedPlans.length}`);
    console.log('===================================================');
  } catch (error: any) {
    console.error('❌ Fatal error during plan scraping:', error.message || error);
    process.exit(1);
  }
}

main();
