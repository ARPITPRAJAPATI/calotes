const mongoose = require('mongoose');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const match = envLocal.match(/MONGODB_URI=(.+)/);
const mongoUri = match ? match[1].trim() : 'mongodb://localhost:27017/test';

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  // 1. Fix Products
  const products = await db.collection('products').find({}).toArray();
  let updatedProducts = 0;
  for (const p of products) {
    if (Array.isArray(p.images)) {
      const newImages = p.images.map(img => {
        if (typeof img === 'string' && img.startsWith('http://')) {
          return img.replace('http://', 'https://');
        }
        return img;
      });
      if (JSON.stringify(newImages) !== JSON.stringify(p.images)) {
        await db.collection('products').updateOne({ _id: p._id }, { $set: { images: newImages } });
        updatedProducts++;
      }
    }
  }

  // 2. Fix Settings
  const settingsList = await db.collection('settings').find({}).toArray();
  let updatedSettings = 0;
  for (const s of settingsList) {
    const updateObj = {};
    if (s.heroImageUrl && s.heroImageUrl.startsWith('http://')) {
      updateObj.heroImageUrl = s.heroImageUrl.replace('http://', 'https://');
    }
    if (s.heroImageMobileUrl && s.heroImageMobileUrl.startsWith('http://')) {
      updateObj.heroImageMobileUrl = s.heroImageMobileUrl.replace('http://', 'https://');
    }
    if (Array.isArray(s.lookbookImages)) {
      updateObj.lookbookImages = s.lookbookImages.map(item => ({
        ...item,
        url: typeof item.url === 'string' && item.url.startsWith('http://') ? item.url.replace('http://', 'https://') : item.url
      }));
    }
    if (Array.isArray(s.brandStoryImages)) {
      updateObj.brandStoryImages = s.brandStoryImages.map(item => ({
        ...item,
        url: typeof item.url === 'string' && item.url.startsWith('http://') ? item.url.replace('http://', 'https://') : item.url
      }));
    }
    if (Array.isArray(s.communityPosts)) {
      updateObj.communityPosts = s.communityPosts.map(item => ({
        ...item,
        url: typeof item.url === 'string' && item.url.startsWith('http://') ? item.url.replace('http://', 'https://') : item.url
      }));
    }

    if (Object.keys(updateObj).length > 0) {
      await db.collection('settings').updateOne({ _id: s._id }, { $set: updateObj });
      updatedSettings++;
    }
  }

  console.log(`Fixed ${updatedProducts} products and ${updatedSettings} settings entries.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
