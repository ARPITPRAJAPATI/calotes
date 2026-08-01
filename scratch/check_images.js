const mongoose = require('mongoose');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const match = envLocal.match(/MONGODB_URI=(.+)/);
const mongoUri = match ? match[1].trim() : 'mongodb://localhost:27017/test';

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).toArray();
  console.log('Total products:', products.length);
  const urls = new Set();
  products.forEach(p => {
    (p.images || []).forEach(img => urls.add(img));
  });
  console.log('Unique Image URLs count:', urls.size);
  console.log('Sample Image URLs:\n', Array.from(urls).slice(0, 20));
  
  // Check settings images as well
  const settings = await db.collection('settings').find({}).toArray();
  console.log('Settings:', settings);
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
