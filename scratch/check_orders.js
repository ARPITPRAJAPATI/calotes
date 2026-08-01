const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://calotes:Arush20057887060426@calotes-md.joa5sqs.mongodb.net/test";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to DB');
    const db = client.db('test');
    
    const orders = await db.collection('orders').find({}).toArray();
    console.log(`Found ${orders.length} orders.`);
    
    const productsMap = new Map();
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const key = item.productId || item.name;
          if (!productsMap.has(key)) {
            productsMap.set(key, {
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              image: item.image,
              sku: item.sku || 'N/A',
              ordersCount: 1
            });
          } else {
            const existing = productsMap.get(key);
            existing.ordersCount += 1;
            productsMap.set(key, existing);
          }
        });
      }
    });
    
    console.log('Unique products found in orders:');
    for (const [key, prod] of productsMap.entries()) {
      console.log('--- PRODUCT ---');
      console.log(JSON.stringify(prod, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
