const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://calotes:calotes.arush2005@calotes-md.joa5sqs.mongodb.net/?appName=calotes-md';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const user = await User.findOne({ email: 'admin@calotes.com' }).select('+password');
    if (!user) {
      console.log('Admin user NOT found!');
      process.exit(1);
    }

    console.log('Admin user found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
    });

    const isMatchLower = await bcrypt.compare('admin123', user.password);
    console.log('Password match for "admin123":', isMatchLower);

    const isMatchUpper = await bcrypt.compare('ADMIN123', user.password);
    console.log('Password match for "ADMIN123":', isMatchUpper);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
