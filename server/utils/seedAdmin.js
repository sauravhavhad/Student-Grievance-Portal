/**
 * Development-only script to seed an initial admin account.
 * Run with: npm run seed:admin (from the /server directory)
 *
 * Reads SEED_ADMIN_* values from .env, falling back to sensible defaults.
 * Admin registration is intentionally NOT exposed via a public API route;
 * this script is the only supported way to create an admin account.
 */

// Fix MongoDB Atlas SRV DNS resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    const email = (
      process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    ).toLowerCase();

    const name =
      process.env.SEED_ADMIN_NAME || 'Admin User';

    const password =
      process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

    const department =
      process.env.SEED_ADMIN_DEPARTMENT || 'Administration';

    // Check if admin already exists
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(
        `Admin account already exists for ${email}. Nothing to do.`
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin account
    await User.create({
      name,
      email,
      password,
      department,
      role: 'admin',
    });

    console.log('Admin account created successfully:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(
      'Please change this password after first login in any non-development environment.'
    );

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error(
      'Failed to seed admin account:',
      err.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

run();