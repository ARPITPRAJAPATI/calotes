const http = require('http');

function test(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\nURL: ${urlPath}`);
          console.log('Status:', res.statusCode);
          console.log('Is Array?', Array.isArray(json));
          console.log('Is Object with products?', Array.isArray(json?.products));
          const prods = Array.isArray(json) ? json : (json?.products || []);
          console.log('Products count:', prods.length);
          prods.forEach(p => console.log(` - [${p.sku || p._id}] ${p.name} (Category: ${p.category})`));
          resolve();
        } catch (e) {
          console.error(`Error parsing JSON for ${urlPath}:`, data.slice(0, 200));
          resolve();
        }
      });
    });
  });
}

async function run() {
  await test('/api/products');
  await test('/api/products?category=mens');
  await test('/api/products?category=denim');
}

run();
