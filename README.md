# Premium Multi-Vendor Ecommerce Marketplace

A production-ready, full-stack ecommerce platform built with **Next.js 15** with integrated backend API routes.

## ⚡ NEW: Backend Migrated to Next.js!

**The backend has been migrated from Express.js to Next.js API routes!** This provides a unified, modern architecture with better performance and simpler deployment.

📖 **See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for complete migration details**
🚀 **See [QUICKSTART.md](./QUICKSTART.md) to get started in 3 steps**

## 🚀 Tech Stack

### Full-Stack Application

- **Next.js 15** (App Router with API Routes)
- **JavaScript/Node.js**
- **MongoDB + Mongoose**
- **TailwindCSS + shadcn/ui**
- **Framer Motion** for animations
- **Zustand** for state management
- **React Hook Form + Zod** for forms

### Backend Services

- **JWT Authentication** with refresh tokens
- **Cloudinary** for image uploads
- **Stripe** for payment processing
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

## 📁 Project Structure

```
next-final-project/
├── client/                          # 🚀 Main Next.js Application (Deploy This!)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                # Backend API Routes
│   │   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   ├── products/       # Product endpoints
│   │   │   │   ├── cart/           # Cart endpoints
│   │   │   │   ├── orders/         # Order endpoints
│   │   │   │   └── payments/       # Payment endpoints
│   │   │   ├── (pages)/            # Frontend pages
│   │   │   └── layout.js
│   │   ├── models/                 # Mongoose Models
│   │   ├── lib/                    # Backend Utilities
│   │   ├── middleware/             # API Middleware
│   │   ├── components/             # React Components
│   │   ├── services/               # API Client
│   │   ├── hooks/                  # React Hooks
│   │   └── store/                  # Zustand Stores
│   ├── .env.local.example          # Environment template
│   ├── vercel.json                 # Vercel deployment config
│   └── package.json
├── archive/                         # Archived Express backend (not deployed)
├── MIGRATION_SUMMARY.md            # Migration overview
├── MIGRATION_GUIDE.md              # Detailed migration docs
├── QUICKSTART.md                   # Quick start guide
├── VERCEL_DEPLOYMENT.md            # ✨ Vercel deployment guide
├── API_MIGRATION_CHECKLIST.md      # Migration progress tracker
└── README.md                        # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start (3 Steps)

1. **Install Dependencies**

```bash
cd client
npm install
```

2. **Configure Environment**

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

Required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_32_chars_minimum
JWT_REFRESH_SECRET=another_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

3. **Start Application**

```bash
npm run dev
```

Visit: `http://localhost:3000` ✨

## � Deploy to Vercel

Ready to deploy? Follow our comprehensive guide:

```bash
cd client
vercel
```

📖 **See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment instructions**

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 3 steps
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Deploy to Vercel
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Migration overview and benefits
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Comprehensive migration documentation
- **[API_MIGRATION_CHECKLIST.md](./API_MIGRATION_CHECKLIST.md)** - Track remaining work
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture details

# Configure environment variables

npm run dev

````

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run dev
````

## 🔐 Test Credentials

The database comes pre-seeded with test accounts. You can login with:

### Admin Account

- **Email:** admin@luxora.com
- **Password:** admin123456
- **Access:** Full admin dashboard, user management, product management, analytics

### Seller Accounts

- **Email:** apple@luxora.com | **Password:** seller123456
- **Email:** samsung@luxora.com | **Password:** seller123456
- **Email:** sony@luxora.com | **Password:** seller123456
- **Access:** Seller dashboard, product management, order management

### Customer Accounts

- **Email:** john@example.com | **Password:** customer123
- **Email:** jane@example.com | **Password:** customer123
- **Access:** Shopping, cart, wishlist, order tracking

## 🌟 Features

### Customer Features

- User authentication (Email, Google OAuth)
- Product browsing, search & filtering
- Shopping cart & wishlist
- Checkout with Stripe & Cash on Delivery
- Order tracking
- Reviews & ratings
- User dashboard

### Seller Features

- Seller registration & profile
- Product management
- Inventory management
- Order management
- Sales analytics
- Earnings dashboard

### Admin Features

- Admin dashboard
- User & seller management
- Product & category management
- Order management
- Banner & coupon management

## � Deployment

Ready to deploy your marketplace to production?

### Quick Start (10 minutes)

See [QUICKSTART.md](QUICKSTART.md) for fastest deployment guide.

### Detailed Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions with troubleshooting.

### Deployment Options

**Recommended Stack (Free):**

- Frontend: Vercel (Next.js optimized)
- Backend: Render or Railway
- Database: MongoDB Atlas (already configured)

**Repository:** Monorepo (single GitHub repo, two deployments)

### Essential Files

- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `DEPLOYMENT_SUMMARY.md` - Overview and architecture
- `server/.env.production.example` - Backend environment template
- `client/.env.production.example` - Frontend environment template

### One Command Deploy

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 2. Deploy backend: render.com (connect repo, set root to 'server')
# 3. Deploy frontend: vercel.com (connect repo, set root to 'client')
# 4. Update CLIENT_URL in backend with your Vercel URL
```

**Cost: $0/month** (free tier for all services)

---

## �📄 License

MIT

## 👥 Author

Built with ❤️ by a senior full-stack engineer
