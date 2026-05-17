const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://calotes:calotes.arush2005@calotes-md.joa5sqs.mongodb.net/?appName=calotes-md';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  const emailArg = process.argv[2];

  if (!emailArg) {
    console.error('Error: Please provide an email address.');
    console.log('Usage: node scratch/make-admin.js your-email@domain.com');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`Error: No user found with email "${email}".`);
      console.log('Please register this email on the website first, then run this script to promote it.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log('\n========================================');
    console.log(` SUCCESS: "${user.name}" (${user.email})`);
    console.log(' HAS BEEN GRANTED FULL ADMIN POWERS! 👑');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

run();
