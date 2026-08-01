const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.next' || file === '.git') return;
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(process.cwd());
console.log('All files in workspace:');
files.forEach(f => {
  const rel = path.relative(process.cwd(), f);
  if (rel.endsWith('.json') || rel.endsWith('.js') || rel.endsWith('.ts') || rel.endsWith('.txt') || rel.endsWith('.csv')) {
    console.log(` - ${rel} (${fs.statSync(f).size} bytes)`);
  }
});
