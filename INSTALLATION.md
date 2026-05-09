# 🚀 Installation Guide

## Phase 1: Setup Complete!

Your premium ecommerce marketplace foundation is ready. Follow these steps to get started:

---

## Backend Installation

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Update .env file with your credentials:**
   - MongoDB connection string
   - JWT secrets
   - Cloudinary credentials
   - Stripe keys
   - Email credentials

5. **Start the backend server:**

   ```bash
   npm run dev
   ```

   Server will run on: `http://localhost:5000`

---

## Frontend Installation

1. **Navigate to client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env.local
   ```

4. **Update .env.local file:**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:3000`

---

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB locally
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
mongod
```

### Option 2: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to `.env` as `MONGO_URI`

---

## Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from Dashboard
3. Add to backend `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## Stripe Setup

1. Sign up at [Stripe](https://stripe.com/)
2. Get your test API keys
3. Add to backend `.env`:
   - `STRIPE_SECRET_KEY`
4. Add to frontend `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password
3. Add to backend `.env`:
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASSWORD=your_app_password`

---

## Verify Installation

### Backend Health Check:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "..."
}
```

### Frontend:

Visit `http://localhost:3000` - you should see the premium homepage!

---

## Next Steps

✅ **Phase 1 Complete:** Project setup, folder structure, configurations

🚧 **Phase 2 Next:** Authentication system with JWT, Google OAuth, email verification

---

## Troubleshooting

### Port Already in Use

```bash
# Backend (kill process on port 5000)
npx kill-port 5000

# Frontend (kill process on port 3000)
npx kill-port 3000
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error

- Check if MongoDB is running
- Verify connection string in `.env`
- Check network access in MongoDB Atlas

---

**Ready to build amazing features! 🎉**
