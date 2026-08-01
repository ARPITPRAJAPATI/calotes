const http = require('http');

const endpoints = [
  '/',
  '/shop',
  '/about',
  '/lookbook',
  '/login',
  '/register',
  '/api/products',
  '/api/categories',
  '/api/settings',
];

function checkEndpoint(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        console.log(`[${res.statusCode}] ${path} (${duration}ms) - Length: ${data.length} bytes`);
        resolve({ path, status: res.statusCode, duration, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
    }).on('error', err => {
      console.error(`[ERROR] ${path}: ${err.message}`);
      resolve({ path, status: 500, error: err.message, ok: false });
    });
  });
}

async function runAudit() {
  console.log('--- STARTING WEBSITE HEALTH AUDIT ---\n');
  const results = [];
  for (const ep of endpoints) {
    const r = await checkEndpoint(ep);
    results.push(r);
  }
  
  console.log('\n--- AUDIT SUMMARY ---');
  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('✅ ALL TESTED ENDPOINTS RETURNED 200 OK!');
  } else {
    console.log(`❌ ${failed.length} ENDPOINTS FAILED:`);
    failed.forEach(f => console.log(` - ${f.path} (${f.status})`));
  }
}

runAudit();
