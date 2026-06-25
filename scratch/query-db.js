const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const lines = envFile.split('\n');
for (const line of lines) {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...val] = line.split('=');
    process.env[key.trim()] = val.join('=').trim();
  }
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('test');
    
    const categories = await db.collection('categories').find({}).toArray();
    console.log('--- Categories ---');
    console.log(categories.map(c => ({ id: c._id, name: c.name, slug: c.slug })));
    
    const products = await db.collection('products').find({}).limit(5).toArray();
    console.log('--- Products ---');
    console.log(products.map(p => ({ id: p._id, name: p.name, category: p.category, brand: p.brand, slug: p.slug })));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
