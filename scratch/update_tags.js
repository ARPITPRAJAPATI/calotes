const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://calotes:Arush20057887060426@calotes-md.joa5sqs.mongodb.net/test";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Update in test DB
    const testDb = client.db('test');
    await testDb.collection('products').updateOne(
      { slug: 'levis-501-light-wash' },
      { $set: { tags: ['denim', 'jeans', 'mens'], description: 'Vintage Levis 501s in a perfect light wash denim. Classic straight leg.' } }
    );
    
    // Update in calotes DB
    const calDb = client.db('calotes');
    await calDb.collection('products').updateOne(
      { slug: 'levis-501-light-wash' },
      { $set: { tags: ['denim', 'jeans', 'mens'], description: 'Vintage Levis 501s in a perfect light wash denim. Classic straight leg.' } }
    );
    
    console.log('Updated tags for Levis 501 in both DBs.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
