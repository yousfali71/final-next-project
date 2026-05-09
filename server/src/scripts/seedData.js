require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Banner = require("../models/Banner");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Drop old username index if it exists
    try {
      await User.collection.dropIndex("username_1");
      console.log("✅ Dropped old username index");
    } catch (err) {
      // Index doesn't exist, ignore
    }

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Banner.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create Users
    console.log("\n👥 Creating users...");
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@luxora.com",
      password: "admin123456",
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    const seller1 = await User.create({
      name: "Apple Store",
      email: "apple@luxora.com",
      password: "seller123456",
      role: "seller",
      isEmailVerified: true,
      isActive: true,
      businessName: "Apple Official Store",
      businessAddress: "Cupertino, CA",
    });

    const seller2 = await User.create({
      name: "Samsung Electronics",
      email: "samsung@luxora.com",
      password: "seller123456",
      role: "seller",
      isEmailVerified: true,
      isActive: true,
      businessName: "Samsung Official Store",
      businessAddress: "Seoul, South Korea",
    });

    const seller3 = await User.create({
      name: "Sony Store",
      email: "sony@luxora.com",
      password: "seller123456",
      role: "seller",
      isEmailVerified: true,
      isActive: true,
      businessName: "Sony Official Store",
      businessAddress: "Tokyo, Japan",
    });

    const customer1 = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "customer123",
      role: "customer",
      isEmailVerified: true,
      isActive: true,
    });

    const customer2 = await User.create({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "customer123",
      role: "customer",
      isEmailVerified: true,
      isActive: true,
    });

    console.log("✅ Users created");

    // Create Categories
    console.log("\n📁 Creating categories...");
    const electronics = await Category.create({
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500",
      isActive: true,
    });

    const smartphones = await Category.create({
      name: "Smartphones",
      slug: "smartphones",
      description: "Latest smartphones and mobile devices",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      parent: electronics._id,
      isActive: true,
    });

    const laptops = await Category.create({
      name: "Laptops",
      slug: "laptops",
      description: "Laptops and notebooks",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      parent: electronics._id,
      isActive: true,
    });

    const audio = await Category.create({
      name: "Audio",
      slug: "audio",
      description: "Headphones, speakers, and audio equipment",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      parent: electronics._id,
      isActive: true,
    });

    const wearables = await Category.create({
      name: "Wearables",
      slug: "wearables",
      description: "Smartwatches and fitness trackers",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      isActive: true,
    });

    const cameras = await Category.create({
      name: "Cameras",
      slug: "cameras",
      description: "Digital cameras and photography equipment",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
      isActive: true,
    });

    console.log("✅ Categories created");

    // Create Products
    console.log("\n📦 Creating products...");

    // Apple Products
    const iphone15 = await Product.create({
      title: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        "The most advanced iPhone ever with A17 Pro chip, titanium design, and enhanced camera system.",
      price: 1199,
      discountPrice: 1099,
      brand: "Apple",
      category: smartphones._id,
      seller: seller1._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          public_id: "iphone-15-1",
        },
        {
          url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          public_id: "iphone-15-2",
        },
      ],
      stock: 50,
      specifications: {
        Display: "6.7-inch Super Retina XDR",
        Processor: "A17 Pro chip",
        Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
        Storage: "256GB",
        Battery: "Up to 29 hours video playback",
      },
      featured: true,
      isActive: true,
    });

    const macbookPro = await Product.create({
      title: "MacBook Pro 16-inch M3 Max",
      slug: "macbook-pro-16-m3-max",
      description:
        "Supercharged by M3 Max chip. Longest battery life ever in a Mac. Stunning Liquid Retina XDR display.",
      price: 2499,
      brand: "Apple",
      category: laptops._id,
      seller: seller1._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          public_id: "macbook-1",
        },
        {
          url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          public_id: "macbook-2",
        },
      ],
      stock: 30,
      specifications: {
        Display: "16.2-inch Liquid Retina XDR",
        Processor: "Apple M3 Max chip",
        RAM: "36GB unified memory",
        Storage: "1TB SSD",
        Battery: "Up to 22 hours",
      },
      featured: true,
      isActive: true,
    });

    const airpodsPro = await Product.create({
      title: "AirPods Pro (2nd generation)",
      slug: "airpods-pro-2nd-gen",
      description:
        "Active Noise Cancellation. Adaptive Audio. Personalized Spatial Audio with dynamic head tracking.",
      price: 249,
      discountPrice: 229,
      brand: "Apple",
      category: audio._id,
      seller: seller1._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
          public_id: "airpods-1",
        },
      ],
      stock: 100,
      specifications: {
        Chip: "H2 chip",
        "Noise Cancellation": "Up to 2x more Active Noise Cancellation",
        Battery: "Up to 6 hours (ANC on)",
        Charging: "MagSafe and wireless charging",
      },
      featured: true,
      isActive: true,
    });

    const appleWatch = await Product.create({
      title: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      description:
        "Advanced health and fitness features. Always-On Retina display. Carbon neutral combinations.",
      price: 399,
      brand: "Apple",
      category: wearables._id,
      seller: seller1._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
          public_id: "watch-1",
        },
      ],
      stock: 75,
      specifications: {
        Display: "Always-On Retina LTPO OLED",
        Processor: "S9 SiP",
        Sensors: "Blood Oxygen, ECG, Heart Rate",
        Battery: "Up to 18 hours",
        "Water Resistance": "50 meters",
      },
      isActive: true,
    });

    // Samsung Products
    const galaxyS24 = await Product.create({
      title: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        "Galaxy AI is here. Epic performance with Snapdragon 8 Gen 3. 200MP camera with Space Zoom.",
      price: 1199,
      discountPrice: 1099,
      brand: "Samsung",
      category: smartphones._id,
      seller: seller2._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
          public_id: "galaxy-1",
        },
      ],
      stock: 60,
      specifications: {
        Display: "6.8-inch Dynamic AMOLED 2X",
        Processor: "Snapdragon 8 Gen 3",
        Camera: "200MP Wide + 50MP Periscope + 12MP Ultra Wide",
        Storage: "256GB",
        Battery: "5000mAh",
      },
      featured: true,
      isActive: true,
    });

    const galaxyBook = await Product.create({
      title: "Samsung Galaxy Book4 Pro",
      slug: "samsung-galaxy-book4-pro",
      description:
        "AI-powered performance. Stunning AMOLED display. All-day battery life.",
      price: 1449,
      brand: "Samsung",
      category: laptops._id,
      seller: seller2._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
          public_id: "galaxybook-1",
        },
      ],
      stock: 25,
      specifications: {
        Display: "16-inch AMOLED",
        Processor: "Intel Core Ultra 7",
        RAM: "16GB",
        Storage: "512GB SSD",
        Battery: "Up to 21 hours",
      },
      isActive: true,
    });

    const galaxyBuds = await Product.create({
      title: "Samsung Galaxy Buds2 Pro",
      slug: "samsung-galaxy-buds2-pro",
      description:
        "Intelligent ANC. Hi-Fi sound quality. 360 Audio. All-day comfort.",
      price: 229,
      discountPrice: 179,
      brand: "Samsung",
      category: audio._id,
      seller: seller2._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          public_id: "buds-1",
        },
      ],
      stock: 80,
      specifications: {
        Drivers: "10mm + 5.3mm 2-way",
        ANC: "Intelligent Active Noise Cancellation",
        Battery: "Up to 8 hours (ANC off)",
        "Water Resistance": "IPX7",
      },
      isActive: true,
    });

    // Sony Products
    const sonyHeadphones = await Product.create({
      title: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description:
        "Industry-leading noise cancellation. Premium sound quality. All-day comfort and battery.",
      price: 399,
      discountPrice: 349,
      brand: "Sony",
      category: audio._id,
      seller: seller3._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
          public_id: "sony-1",
        },
      ],
      stock: 45,
      specifications: {
        "Driver Unit": "30mm",
        "Noise Cancellation": "Industry-leading ANC",
        Battery: "Up to 30 hours",
        Connectivity: "Bluetooth 5.2, Multipoint",
      },
      featured: true,
      isActive: true,
    });

    const sonyCamera = await Product.create({
      title: "Sony Alpha 7 IV",
      slug: "sony-alpha-7-iv",
      description:
        "33MP full-frame sensor. Advanced AI processing. 4K 60p video. Perfect for creators.",
      price: 2499,
      brand: "Sony",
      category: cameras._id,
      seller: seller3._id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1606941525019-30d7e27df8dc?w=800",
          public_id: "camera-1",
        },
      ],
      stock: 15,
      specifications: {
        Sensor: "33MP Full-Frame Exmor R",
        "ISO Range": "100-51200",
        Video: "4K 60p 10-bit 4:2:2",
        Autofocus: "759-point Fast Hybrid AF",
        Stabilization: "5-axis in-body",
      },
      isActive: true,
    });

    console.log("✅ Products created");

    // Create Reviews
    console.log("\n⭐ Creating reviews...");

    await Review.create({
      product: iphone15._id,
      user: customer1._id,
      rating: 5,
      comment:
        "Absolutely amazing phone! The camera quality is outstanding and the battery lasts all day. Best iPhone yet!",
      verified: true,
    });

    await Review.create({
      product: iphone15._id,
      user: customer2._id,
      rating: 5,
      comment:
        "Love the titanium design and the action button. Performance is blazing fast!",
      verified: true,
    });

    await Review.create({
      product: macbookPro._id,
      user: customer1._id,
      rating: 5,
      comment:
        "Perfect for my video editing work. The M3 Max chip handles everything I throw at it. Battery life is incredible!",
      verified: true,
    });

    await Review.create({
      product: airpodsPro._id,
      user: customer2._id,
      rating: 5,
      comment:
        "Best noise cancellation I've ever experienced. Adaptive audio is a game changer for commuting.",
      verified: true,
    });

    await Review.create({
      product: galaxyS24._id,
      user: customer1._id,
      rating: 5,
      comment:
        "The AI features are incredible! Camera zoom is unmatched. S Pen is so useful for notes.",
      verified: true,
    });

    await Review.create({
      product: sonyHeadphones._id,
      user: customer2._id,
      rating: 5,
      comment:
        "Sound quality is phenomenal. Noise cancellation works perfectly on flights. Super comfortable!",
      verified: true,
    });

    // Update product ratings
    await Product.findByIdAndUpdate(iphone15._id, {
      "ratings.average": 5,
      "ratings.count": 2,
    });

    await Product.findByIdAndUpdate(macbookPro._id, {
      "ratings.average": 5,
      "ratings.count": 1,
    });

    await Product.findByIdAndUpdate(airpodsPro._id, {
      "ratings.average": 5,
      "ratings.count": 1,
    });

    await Product.findByIdAndUpdate(galaxyS24._id, {
      "ratings.average": 5,
      "ratings.count": 1,
    });

    await Product.findByIdAndUpdate(sonyHeadphones._id, {
      "ratings.average": 5,
      "ratings.count": 1,
    });

    console.log("✅ Reviews created");

    // Create Banners
    console.log("\n🎨 Creating banners...");

    await Banner.create({
      title: "iPhone 15 Pro",
      subtitle: "Titanium. So strong. So light. So Pro.",
      image: {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1920",
        public_id: "banner-iphone",
      },
      link: "/products/iphone-15-pro-max",
      buttonText: "Shop Now",
      position: "hero",
      order: 1,
      isActive: true,
    });

    await Banner.create({
      title: "MacBook Pro",
      subtitle: "Mind-blowing. Head-turning.",
      image: {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920",
        public_id: "banner-macbook",
      },
      link: "/products/macbook-pro-16-m3-max",
      buttonText: "Learn More",
      position: "hero",
      order: 2,
      isActive: true,
    });

    await Banner.create({
      title: "Galaxy S24 Ultra",
      subtitle: "Galaxy AI is here. Epic in every way.",
      image: {
        url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1920",
        public_id: "banner-galaxy",
      },
      link: "/products/samsung-galaxy-s24-ultra",
      buttonText: "Explore",
      position: "hero",
      order: 3,
      isActive: true,
    });

    console.log("✅ Banners created");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ DATABASE SEEDED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   • ${await User.countDocuments()} Users created`);
    console.log(`   • ${await Category.countDocuments()} Categories created`);
    console.log(`   • ${await Product.countDocuments()} Products created`);
    console.log(`   • ${await Review.countDocuments()} Reviews created`);
    console.log(`   • ${await Banner.countDocuments()} Banners created`);

    console.log("\n👤 Test Accounts:");
    console.log("   Admin:");
    console.log("   • Email: admin@luxora.com");
    console.log("   • Password: admin123456");
    console.log("\n   Sellers:");
    console.log("   • Email: apple@luxora.com | Password: seller123456");
    console.log("   • Email: samsung@luxora.com | Password: seller123456");
    console.log("   • Email: sony@luxora.com | Password: seller123456");
    console.log("\n   Customers:");
    console.log("   • Email: john@example.com | Password: customer123");
    console.log("   • Email: jane@example.com | Password: customer123");

    console.log("\n🌐 Access the app at: http://localhost:3001");
    console.log("=".repeat(50) + "\n");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error(error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
