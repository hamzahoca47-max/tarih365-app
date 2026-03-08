import fs from 'fs';

const logPath = '/.gemini/antigravity/brain/62d8ff72-26e4-499f-876f-e8be52ddb5f8/.system_generated/logs/overview.txt';

try {
  const logContent = fs.readFileSync(logPath, 'utf-8');
  
  // Find the start of the JSON
  const jsonStartIndex = logContent.indexOf('{\n  "siniflar": {');
  if (jsonStartIndex !== -1) {
    // Find the end of the JSON (before ==Start of PDF==)
    const pdfStartIndex = logContent.indexOf('==Start of PDF==', jsonStartIndex);
    let jsonString = '';
    
    if (pdfStartIndex !== -1) {
      jsonString = logContent.substring(jsonStartIndex, pdfStartIndex).trim();
    } else {
      // Try to find the end of the JSON by matching braces
      jsonString = logContent.substring(jsonStartIndex);
    }
    
    // Write to initialData.json
    fs.mkdirSync('./src/data', { recursive: true });
    fs.writeFileSync('./src/data/initialData.json', jsonString);
    console.log('Successfully extracted JSON to src/data/initialData.json');
  } else {
    console.log('Could not find JSON start in log file.');
  }
} catch (err) {
  console.error('Error:', err);
}
