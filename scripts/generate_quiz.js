import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from your existing ZIEORK AI environment file so you don't have to copy keys!
dotenv.config({ path: path.join(__dirname, "../../ZIEORK AI/.env.local") });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OUTPUT_FILE = path.join(__dirname, "../src/data/questions.js");

if (!OPENROUTER_API_KEY) {
  console.error("❌ ERROR: OPENROUTER_API_KEY not found in ZIEORK AI/.env.local");
  process.exit(1);
}

const CATEGORIES = ["Gen AI", "AWS", "GitHub", "GitLab"];
const TARGET_PER_CATEGORY = 500;
const BATCH_SIZE = 10;

async function generateBatch(category) {
  const prompt = `
Generate exactly ${BATCH_SIZE} unique multiple-choice questions for the category "${category}". 
The questions must be highly technical, accurate, and challenging.
Output ONLY valid JSON format as an array of objects. Do not include markdown blocks like \`\`\`json. 
Each object must follow this interface exactly:
{
  "id": "string (unique id)",
  "category": "${category}",
  "question": "string (the question text)",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (index of correct option 0-3),
  "explanation": "string (detailed explanation of why the answer is correct)"
}
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    let text = data.choices[0].message.content.trim();
    
    if (text.startsWith("```json")) text = text.replace(/```json/g, "");
    if (text.endsWith("```")) text = text.replace(/```/g, "");
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error generating batch for ${category}:`, error.message);
    return [];
  }
}

async function main() {
  console.log("🚀 Starting Automatic 2,000 Question Generator...");
  
  // Read existing questions from the frontend JS file
  let existingData = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const fileContent = fs.readFileSync(OUTPUT_FILE, "utf-8");
      // Extract the JSON array from the JS export
      const jsonStr = fileContent.replace("export const quizQuestions = ", "").replace(/;\s*$/, "");
      existingData = JSON.parse(jsonStr);
    } catch (e) {
      console.log("Could not parse existing frontend data. Starting fresh.");
    }
  }

  for (const category of CATEGORIES) {
    const currentCount = existingData.filter(q => q.category === category).length;
    let needed = TARGET_PER_CATEGORY - currentCount;
    
    console.log(`\n▶ [${category}] Found ${currentCount}/${TARGET_PER_CATEGORY}. Need ${needed} more.`);

    while (needed > 0) {
      const generateCount = Math.min(BATCH_SIZE, needed);
      process.stdout.write(`Generating batch of ${generateCount} for ${category}... `);
      
      const newQuestions = await generateBatch(category);
      
      if (newQuestions && newQuestions.length > 0) {
        existingData = [...existingData, ...newQuestions];
        
        // Write the data back directly into the frontend JS file
        const fileContent = `export const quizQuestions = ${JSON.stringify(existingData, null, 2)};`;
        fs.writeFileSync(OUTPUT_FILE, fileContent);
        
        console.log(`✅ Saved. Total ${category}: ${existingData.filter(q => q.category === category).length}`);
        needed -= newQuestions.length;
      } else {
        console.log("❌ Failed to parse response. Retrying...");
      }

      // Small delay to prevent rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n🎉 Generation complete! All 2,000 questions are now hardcoded in your frontend.");
}

main();
