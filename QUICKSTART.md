# Quick Start Guide - Next.js Backend Migration

## 🎯 What Changed?

Your application has been migrated from a separate Node.js/Express backend to Next.js API routes. Everything now runs in a single Next.js application!

## 🚀 Getting Started (3 Steps)

### 1. Install Dependencies

```powershell
cd client
npm install
```

New packages added:

- `mongoose` - Database
- `bcryptjs` - Password security
- `jsonwebtoken` - Authentication
- `cloudinary` - Image uploads
- `stripe` - Payments
- `nodemailer` - Emails

### 2. Set Up Environment Variables

Create `.env.local` file in the `client` folder:

```powershell
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Required - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Required - Create random strings (32+ characters)
JWT_SECRET=your_random_secret_here
JWT_REFRESH_SECRET=another_random_secret_here

# Required for image uploads - Get from Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Required for payments - Get from Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Required for emails - Use Gmail or other SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Premium Marketplace

# Default values (no change needed for local dev)
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
NODE_ENV=development
```

### 3. Run the Application

```powershell
npm run dev
```

✅ Your app is now running at `http://localhost:3000`
✅ API routes are at `http://localhost:3000/api/*`

## 📋 What Works Now?

### ✅ Migrated Routes

**Authentication** (`/api/auth/`)

- Registration, Login, Logout
- Password reset
- Email verification
- Google OAuth
- Token refresh

**Products** (`/api/products/`)

- List products with filters
- Get single product
- Search and pagination

**Cart** (`/api/cart/`)

- View cart
- Add/update/remove items
- Clear cart

**Orders** (`/api/orders/`)

- Create order
- View order history

**Payments** (`/api/payments/`)

- Create Stripe payment intent

### 🔄 Need Migration

You'll need to migrate these routes yourself (see MIGRATION_GUIDE.md):

- Categories management
- Reviews system
- Coupons
- Banners
- Seller dashboard
- Admin dashboard
- User profile management

## 📝 Key Changes for Developers

### Old Way (Express):

```javascript
// server/src/routes/auth.js
router.post("/login", authController.login);

// server/src/controllers/authController.js
exports.login = async (req, res) => {
  // ...
  res.status(200).json({ user, token });
};
```

### New Way (Next.js):

```javascript
// client/src/app/api/auth/login/route.js
export async function POST(request) {
  // ...
  return sendSuccess({ user, token }, 200);
}
```

### Accessing APIs:

**Before:** `http://localhost:5000/api/auth/login`
**Now:** `http://localhost:3000/api/auth/login`

Your frontend code automatically updated - no changes needed! ✅

## 🔧 Testing

### Test Registration:

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"password123\"}'
```

### Test Login:

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"password123\"}'
```

### Test Products:

```powershell
curl http://localhost:3000/api/products
```

## 🐛 Common Issues

### "MongoDB connection failed"

→ Check MONGODB_URI in `.env.local`
→ Whitelist your IP in MongoDB Atlas

### "JWT secret not defined"

→ Add JWT_SECRET and JWT_REFRESH_SECRET to `.env.local`

### "Email not sending"

→ For Gmail: Enable 2FA and create App Password
→ Use the App Password in EMAIL_PASSWORD

### "Cannot find module '@/models/User'"

→ Run `npm install` in client folder

## 📚 Next Steps

1. **Test the migrated routes** - Try registration, login, products, cart
2. **Migrate remaining routes** - Use templates in MIGRATION_GUIDE.md
3. **Deploy** - Deploy to Vercel or similar platform

## 📖 Documentation

- Full migration details: `MIGRATION_GUIDE.md`
- Next.js API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- MongoDB with Next.js: https://mongoosejs.com/docs/nextjs.html

## 🎉 Benefits

- ✅ **Simpler deployment** - One app instead of two
- ✅ **Better performance** - Optimized Next.js features
- ✅ **Easier development** - One codebase
- ✅ **Lower costs** - Single hosting solution

## 💡 Need Help?

1. Check `MIGRATION_GUIDE.md` for detailed docs
2. Look at migrated routes as examples
3. Review Next.js documentation

---

**Ready to go!** Start with `npm run dev` and test the application.
