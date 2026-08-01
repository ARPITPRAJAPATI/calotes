const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://calotes:Arush20057887060426@calotes-md.joa5sqs.mongodb.net/test";

const productsToRestore = [
  {
    name: "Arush T shirt",
    slug: "arush-t-shirt",
    description: "Authentic vintage Arush T shirt. High quality cotton, loose comfortable fit.",
    price: 2500,
    brand: "Arush",
    condition: "Great",
    sizes: ["XXL"],
    images: ["https://res.cloudinary.com/dyyrgid3b/image/upload/v1784703712/calotes-vintage/dv2c9xtx2mrtgtzyfafl.webp"],
    sku: "CV-ARUSH-001",
    stock: 1,
    isFeatured: true,
    measurements: { pitToPit: "24\"", length: "30\"" }
  },
  {
    name: "Dickies 'American Original' Navy Blue T-Shirt",
    slug: "dickies-american-original-navy-blue-t-shirt",
    description: "Classic vintage Dickies 'American Original' Graphic T-Shirt in Navy Blue. Iconic chest print, durable fabric.",
    price: 399,
    brand: "Dickies",
    condition: "Excellent",
    sizes: ["M"],
    images: ["https://res.cloudinary.com/dyyrgid3b/image/upload/v1785507525/calotes-vintage/prwp7t9f9g1fldfpnmd1.jpg"],
    sku: "CV-DICKIES-001",
    stock: 1,
    isFeatured: false,
    measurements: { pitToPit: "20\"", length: "27\"" }
  }
];

async function restoreInDb(client, dbName) {
  console.log(`\nRestoring in database: ${dbName}`);
  const db = client.db(dbName);
  
  // Find mens category
  const mensCategory = await db.collection('categories').findOne({ slug: 'mens' });
  if (!mensCategory) {
    console.error(`[-] Mens category not found in ${dbName}`);
    return;
  }
  
  console.log(`[+] Found Mens category: ${mensCategory._id} (${mensCategory.name})`);
  
  for (const prod of productsToRestore) {
    const productData = {
      ...prod,
      category: mensCategory._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if product already exists by slug or SKU
    const existing = await db.collection('products').findOne({ slug: prod.slug });
    if (existing) {
      console.log(`[*] Product already exists in ${dbName}: ${prod.name}. Updating.`);
      await db.collection('products').updateOne(
        { slug: prod.slug },
        { $set: productData }
      );
    } else {
      console.log(`[+] Inserting product in ${dbName}: ${prod.name}`);
      await db.collection('products').insertOne(productData);
    }
  }
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('[+] Connected successfully to MongoDB Atlas');
    
    await restoreInDb(client, 'test');
    await restoreInDb(client, 'calotes');
    
    console.log('\n[+] Restore completed successfully!');
  } catch (err) {
    console.error('[-] Error restoring products:', err);
  } finally {
    await client.close();
  }
}

run();
