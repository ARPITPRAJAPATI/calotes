const http = require('http');

http.get('http://localhost:3000/', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Data length:', data.length);
    console.log('Preview:', data.slice(0, 1000));
  });
}).on('error', err => {
  console.error('Fetch error:', err.message);
});
