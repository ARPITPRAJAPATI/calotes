const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://calotes:Arush20057887060426@calotes-md.joa5sqs.mongodb.net/test";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases on this cluster:');
    for (const db of dbs.databases) {
      console.log(` - ${db.name} (${Math.round(db.sizeOnDisk / 1024)} KB)`);
      const database = client.db(db.name);
      const collections = await database.listCollections().toArray();
      for (const col of collections) {
        const count = await database.collection(col.name).countDocuments();
        console.log(`    -> Collection: ${col.name} (Docs: ${count})`);
      }
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    await client.close();
  }
}

run();
