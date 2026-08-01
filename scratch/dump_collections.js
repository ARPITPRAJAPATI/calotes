const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://calotes:Arush20057887060426@calotes-md.joa5sqs.mongodb.net/test";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    
    // Check "test" database
    console.log('--- TEST DB ---');
    const testDb = client.db('test');
    const testProducts = await testDb.collection('products').find({}).toArray();
    console.log('Products in test:');
    testProducts.forEach(p => console.log(` - [${p.sku}] ${p.name} ($${p.price})`));

    // Check "calotes" database
    console.log('\n--- CALOTES DB ---');
    const calDb = client.db('calotes');
    const calProducts = await calDb.collection('products').find({}).toArray();
    console.log('Products in calotes:');
    calProducts.forEach(p => console.log(` - [${p.sku}] ${p.name} ($${p.price})`));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
