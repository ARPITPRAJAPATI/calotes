const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dyyrgid3b',
  api_key: '473483833657914',
  api_secret: 'DlFi7OJQYozNFJUpydc0r2UV52U'
});

async function run() {
  try {
    console.log('Fetching Cloudinary assets...');
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'calotes-vintage',
      max_results: 100
    });
    
    console.log(`Found ${result.resources.length} assets:`);
    result.resources.forEach(r => {
      console.log(` - [${r.created_at}] ${r.public_id} (${r.format}, ${r.bytes} bytes) URL: ${r.secure_url}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
