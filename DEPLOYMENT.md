# 🚀 Deployment Guide - Luxora Marketplace

Complete guide to deploy your Next.js + Node.js e-commerce platform to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ MongoDB Atlas database (already configured)
- ✅ ImageKit account for image uploads
- ✅ Stripe account for payments
- ✅ Email service (Gmail/SendGrid/Resend)

---

## Repository Setup

### Option 1: Single Monorepo (Recommended)

Push everything to one repository:

```bash
cd next-final-project

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Luxora marketplace"

# Add remote repository
git remote add origin https://github.com/yourusername/luxora-marketplace.git

# Push to GitHub
git push -u origin main
```

### Option 2: Separate Repositories

If you prefer separate repos:

```bash
# Backend repository
cd server
git init
git add .
git commit -m "Backend: Initial commit"
git remote add origin https://github.com/yourusername/luxora-backend.git
git push -u origin main

# Frontend repository
cd ../client
git init
git add .
git commit -m "Frontend: Initial commit"
git remote add origin https://github.com/yourusername/luxora-frontend.git
git push -u origin main
```

---

## Backend Deployment

### Deploy to Render (Free Tier Available)

**Step 1: Create Account**

- Go to [render.com](https://render.com)
- Sign up with GitHub

**Step 2: Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `luxora-backend`
   - **Root Directory**: `server` (if monorepo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: Free

**Step 3: Environment Variables**

Add these in Render dashboard (Environment tab):

```env
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://yourusername:password@cluster.mongodb.net/team

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS - Update after frontend deployment
CLIENT_URL=https://your-frontend-url.vercel.app

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_/jG2+xt71TzVVQfrg1a249QUQWM=
IMAGEKIT_PRIVATE_KEY=private_8AW9KVhkCXT5fuPnhv2ysfG+EV8=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/m9tmcxc1lq

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@luxora.com

# Google OAuth
GOOGLE_CLIENT_ID=850330529353-c7pjdhrfc3fm8d4a7mh1ob2mppq6ai0c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Step 4: Deploy**

- Click **"Create Web Service"**
- Wait 3-5 minutes for deployment
- Copy your backend URL: `https://luxora-backend.onrender.com`

**Important:** Render free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

### Alternative: Railway

Railway offers 500 hours/month free:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd server
railway init
railway up

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGO_URI=your-mongodb-uri
# ... add all other variables
```

---

## Frontend Deployment

### Deploy to Vercel (Recommended - Free)

Vercel is made by the Next.js team and offers the best performance.

**Step 1: Prepare Environment**

Create `client/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://luxora-backend.onrender.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=850330529353-c7pjdhrfc3fm8d4a7mh1ob2mppq6ai0c.apps.googleusercontent.com
```

**Step 2: Deploy with Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client
cd client

# Login
vercel login

# Deploy to production
vercel --prod
```

**Step 3: Deploy via Vercel Dashboard (Alternative)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `client` (if monorepo)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)

5. **Environment Variables** (click "Environment Variables"):

   ```
   NEXT_PUBLIC_API_URL=https://luxora-backend.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=850330529353-...
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Copy your frontend URL: `https://luxora.vercel.app`

**Step 4: Update Backend CORS**

Go back to Render and update:

```env
CLIENT_URL=https://luxora.vercel.app
```

Then redeploy backend (Render will auto-redeploy).

### Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

cd client
netlify login
netlify init
netlify deploy --prod
```

---

## Post-Deployment

### 1. Update MongoDB Atlas IP Whitelist

For serverless deployments (Vercel/Render):

1. Go to MongoDB Atlas
2. Network Access
3. Click "Add IP Address"
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Save

### 2. Test Your Application

Visit your frontend URL and test:

- ✅ Homepage loads
- ✅ Products page displays items
- ✅ Login/Register works
- ✅ Cart functionality
- ✅ Admin/Seller dashboards
- ✅ API requests succeed (check browser console)

### 3. Configure Custom Domain (Optional)

**Vercel:**

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` in backend

**Render:**

1. Go to Settings → Custom Domain
2. Add domain and configure DNS

### 4. Seed Production Database

```bash
# Connect to your deployed backend URL
# Update seedData.js to use production API or run locally with production MONGO_URI

node src/scripts/seedData.js
```

Or create an admin user directly:

```bash
node src/scripts/createAdmin.js
```

### 5. Set up Monitoring (Optional but Recommended)

**Vercel Analytics:**

- Automatic in Vercel dashboard

**Render Logs:**

- View in Render dashboard under "Logs"

**Sentry (Error Tracking):**

```bash
npm install @sentry/nextjs @sentry/node
```

---

## Troubleshooting

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**

- Verify `CLIENT_URL` in backend exactly matches frontend URL (no trailing slash)
- Check CORS middleware in `server/src/server.js`
- Ensure backend is running (check Render logs)

### API 500 Errors

**Problem:** "Schema hasn't been registered for model"

**Solution:**

- Already fixed - models are preloaded in `server.js`
- Check Render logs for specific errors

### Database Connection Failed

**Problem:** Can't connect to MongoDB

**Solution:**

- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions

### Images Not Loading

**Problem:** Image uploads fail

**Solution:**

- Verify ImageKit credentials
- Check ImageKit dashboard for quota
- Ensure `IMAGEKIT_URL_ENDPOINT` is correct

### Render Free Tier Slowness

**Problem:** First request takes 30+ seconds

**Solution:**

- Render free tier spins down after 15 min inactivity
- Consider upgrading to paid tier ($7/month) for always-on
- Or use Railway (500 hours/month free)

### Build Fails

**Problem:** Vercel/Render build errors

**Solution:**

```bash
# Test build locally first
cd client
npm run build

cd ../server
node src/server.js
```

- Fix any errors
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

---

## 🎉 Deployment Complete!

Your application is now live:

- **Frontend**: https://luxora.vercel.app
- **Backend**: https://luxora-backend.onrender.com
- **Database**: MongoDB Atlas

**Test Accounts:**

- Admin: `admin@luxora.com` / `admin123456`
- Seller: `apple@luxora.com` / `seller123456`
- Customer: `john@example.com` / `customer123`

---

## 📊 Cost Breakdown

**Free Tier (Recommended for MVP):**

- MongoDB Atlas: 512MB free forever
- Vercel: Unlimited deployments
- Render: 750 hours/month free
- ImageKit: 20GB/month free
- **Total: $0/month**

**Paid Tier (For Production):**

- MongoDB Atlas M2: $9/month
- Vercel Pro: $20/month (optional)
- Render Standard: $7/month
- ImageKit Pro: $9/month
- **Total: ~$25-45/month**

---

## 🔒 Security Checklist

Before going live:

- ✅ All `.env` files ignored in `.gitignore`
- ✅ Strong JWT secrets (32+ characters)
- ✅ MongoDB IP whitelist configured
- ✅ HTTPS enabled (automatic on Vercel/Render)
- ✅ Rate limiting enabled (already configured)
- ✅ Input validation (Zod schemas active)
- ✅ Password hashing (bcrypt active)
- ✅ CORS properly configured
- ✅ Production error handling active

---

## 🔄 Continuous Deployment

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Automatically triggers:
# - Vercel redeploys frontend (~2 minutes)
# - Render redeploys backend (~3 minutes)
```

---

## 📞 Need Help?

Common issues already solved in code:

- ✅ Models loading correctly
- ✅ CORS configured
- ✅ JWT refresh tokens
- ✅ Image uploads
- ✅ Pagination
- ✅ Error handling

For deployment-specific issues, check:

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

---

**Ready to deploy? Start with the backend first, then frontend!** 🚀
