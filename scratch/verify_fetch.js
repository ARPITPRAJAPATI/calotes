const http = require('http');

http.get('http://localhost:3000/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('API Status:', res.statusCode);
      console.log('res.ok?', res.statusCode >= 200 && res.statusCode < 300);
      const productList = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.products) ? parsed.products : []);
      console.log('Parsed productList length:', productList.length);
      if (productList.length > 0) {
        console.log('Sample product:', productList[0].name);
      }
    } catch (e) {
      console.error('Error parsing:', e);
    }
  });
});
