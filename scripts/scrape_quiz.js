import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, "../src/data/questions.js");

// Target URLs for scraping (Examples of tech blogs/interview sites)
const SOURCES = [
  {
    category: "AWS",
    url: "https://www.interviewbit.com/aws-interview-questions/",
    questionSelector: "h3",
    answerSelector: ".answer-content p"
  },
  {
    category: "GitHub",
    url: "https://www.javatpoint.com/github-interview-questions",
    questionSelector: ".h3",
    answerSelector: ".pq"
  },
  {
    category: "GitLab",
    url: "https://www.tutorialspoint.com/gitlab/gitlab_interview_questions.htm",
    questionSelector: "h3",
    answerSelector: ".ans p"
  },
  {
    category: "Gen AI",
    url: "https://www.simplilearn.com/tutorials/artificial-intelligence-tutorial/generative-ai-interview-questions",
    questionSelector: "h3",
    answerSelector: "p"
  }
];

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Normalizes an extracted question into our required multiple-choice JSON format.
 * Since most scraped interview sites are Q&A format (not multiple choice),
 * this function synthetically generates 3 plausible but incorrect options 
 * to fulfill the multiple-choice requirement, or extracts them if they exist in the HTML.
 */
function formatAsMultipleChoice(category, questionText, answerText) {
  // Try to find if the answer text actually contains options (A, B, C, D)
  const optionsMatch = answerText.match(/([A-D]\).*?)(?=[A-D]\)|$)/gs);
  
  let options = [];
  let correctAnswerIdx = 0;
  let explanation = answerText.substring(0, 200) + "..."; // Keep explanation concise

  if (optionsMatch && optionsMatch.length >= 2) {
    // It's a real multiple choice question!
    options = optionsMatch.map(o => o.replace(/^[A-D]\)\s*/, "").trim());
    // Guess the correct answer (Default to 0 if we can't parse the exact correct one)
    correctAnswerIdx = 0; 
  } else {
    // It's a standard Q&A. We must convert it to multiple choice.
    const trueAnswer = answerText.split(".")[0].trim().substring(0, 100); // First sentence
    options = [
      trueAnswer,
      "None of the above",
      "Both A and B",
      "This feature is deprecated"
    ];
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    correctAnswerIdx = options.indexOf(trueAnswer);
  }

  // Ensure we always have 4 options
  while (options.length < 4) {
    options.push(`Alternative option ${options.length + 1}`);
  }
  options = options.slice(0, 4);

  return {
    id: `${category.toLowerCase().replace(" ", "")}-${generateId()}`,
    category,
    question: questionText.trim().replace(/^\d+\.\s*/, ""), // Remove numbering
    options,
    correctAnswer: correctAnswerIdx,
    explanation
  };
}

async function scrapeSite(browser, source) {
  console.log(`[Scraper] Navigating to ${source.url} for ${source.category}...`);
  const page = await browser.newPage();
  
  try {
    await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    
    // Scroll to the bottom to lazy load content if necessary
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    // Extract questions and answers based on typical DOM structures
    $(source.questionSelector).each((i, el) => {
      const questionText = $(el).text().trim();
      
      // Usually, the answer is the immediate sibling paragraph or div
      let answerText = $(el).nextUntil(source.questionSelector, source.answerSelector).text().trim();
      
      // Fallback: just get the very next text block
      if (!answerText) {
         answerText = $(el).next().text().trim();
      }

      if (questionText.length > 10 && questionText.includes("?") && answerText.length > 5) {
        const mcq = formatAsMultipleChoice(source.category, questionText, answerText);
        results.push(mcq);
      }
    });

    console.log(`[Scraper] Successfully extracted ${results.length} questions from ${source.category}.`);
    return results;
  } catch (error) {
    console.error(`[Scraper] Error scraping ${source.category}:`, error.message);
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("🚀 Starting Playwright Web Scraper...");
  
  // Load existing data to append to it
  let existingData = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    } catch (e) {
      console.log("Could not read existing JSON, starting fresh.");
    }
  }

  const browser = await chromium.launch({ headless: true });
  
  let totalNew = 0;
  for (const source of SOURCES) {
    const scrapedQuestions = await scrapeSite(browser, source);
    if (scrapedQuestions.length > 0) {
      existingData = [...existingData, ...scrapedQuestions];
      totalNew += scrapedQuestions.length;
    }
  }

  await browser.close();

  // Deduplicate by question text
  const uniqueData = Array.from(new Map(existingData.map(item => [item.question, item])).values());
  
  const fileContent = `export const quizQuestions = ${JSON.stringify(uniqueData, null, 2)};`;
  fs.writeFileSync(OUTPUT_FILE, fileContent);
  
  console.log(`\n✅ Scrape complete! Added ${totalNew} new questions.`);
  console.log(`📊 Total questions in database: ${uniqueData.length}`);
  console.log(`File saved to: ${OUTPUT_FILE}`);
}

main();
