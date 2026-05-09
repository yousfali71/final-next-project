require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log("Email:", existingAdmin.email);
      console.log("Name:", existingAdmin.name);
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminData = {
      name: "Admin User",
      email: "admin@luxora.com",
      password: "admin123456", // Will be hashed automatically by the User model
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    };

    const admin = await User.create(adminData);

    console.log("\n✅ Admin user created successfully!");
    console.log("==========================================");
    console.log("Email:", admin.email);
    console.log("Password: admin123456");
    console.log("Role:", admin.role);
    console.log("==========================================");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log(
      "\n📍 Access admin dashboard at: http://localhost:3000/admin/dashboard",
    );

    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUser();
