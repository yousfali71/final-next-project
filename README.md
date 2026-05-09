# Premium Multi-Vendor Ecommerce Marketplace

A production-ready, full-stack ecommerce platform built with Next.js 15 and Node.js.

## 🚀 Tech Stack

### Frontend

- Next.js 15 (App Router)
- JavaScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Zustand
- Axios
- React Hook Form + Zod

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Stripe
- Nodemailer/Resend

## 📁 Project Structure

```
ecommerce-platform/
├── client/          # Next.js frontend
├── server/          # Node.js backend
├── docs/            # Documentation
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

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
