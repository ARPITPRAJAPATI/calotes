const fs = require('fs');
const path = require('path');

const logsDir = 'C:/Users/arpit/.gemini/antigravity-ide/brain/21500085-88b7-40e8-9bee-ee5aa5b0e6dd/.system_generated/logs';

function searchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('arush') || line.toLowerCase().includes('dickies') || line.toLowerCase().includes('t-shirt') || line.toLowerCase().includes('shirt')) {
      console.log(`[${path.basename(filePath)}:${idx}]`);
      if (line.length < 1000) {
        console.log(line.trim());
      } else {
        console.log(line.slice(0, 500) + '...');
        console.log('... (truncated) ...');
        // Let's search if there are JSON objects in this line
        const matches = line.match(/{[^{}]+arush[^{}]+}/gi);
        if (matches) {
          matches.forEach(m => console.log('MATCH:', m));
        }
      }
    }
  });
}

searchFile(path.join(logsDir, 'transcript.jsonl'));
searchFile(path.join(logsDir, 'transcript_full.jsonl'));
