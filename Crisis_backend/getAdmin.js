const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findOrCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      // Reset the password so you can log in
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Admin found! Password has been reset to "admin123".');
      console.log('--- Admin Login Details ---');
      console.log(`Email:    ${admin.email}`);
      console.log(`Password: admin123`);
      console.log('---------------------------');
    } else {
      // Create a new admin
      admin = new User({
        name: 'Super Admin',
        email: 'admin@crisisconnect.com',
        password: 'admin123',
        role: 'admin',
      });
      await admin.save();
      console.log('✅ New Admin created!');
      console.log('--- Admin Login Details ---');
      console.log(`Email:    admin@crisisconnect.com`);
      console.log(`Password: admin123`);
      console.log('---------------------------');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fetching admin:', error);
    process.exit(1);
  }
};

findOrCreateAdmin();
