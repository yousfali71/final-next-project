# Migration from Node.js Backend to Next.js API Routes - Complete Guide

## 🎯 Migration Overview

This project has been successfully migrated from a separate Node.js/Express backend to fully integrated Next.js API routes. This provides a unified, streamlined architecture with better performance and easier deployment.

## ✅ What Has Been Migrated

### 1. **Database Layer**

- ✅ MongoDB connection with Next.js caching
- ✅ All Mongoose models (User, Product, Order, Cart, Review, Coupon, Banner, Category)
- ✅ Model validation and middleware (pre-save hooks, password hashing, etc.)

### 2. **Authentication & Security**

- ✅ JWT token generation and verification
- ✅ Authentication middleware for protected routes
- ✅ Role-based authorization
- ✅ Password hashing with bcrypt
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Google OAuth support

### 3. **API Routes**

All Express routes have been converted to Next.js API routes:

#### Authentication Routes (`/api/auth/`)

- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/logout` - User logout
- ✅ `POST /api/auth/refresh` - Refresh access token
- ✅ `GET /api/auth/verify-email/[token]` - Email verification
- ✅ `POST /api/auth/forgot-password` - Request password reset
- ✅ `POST /api/auth/reset-password` - Reset password
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/google` - Google OAuth

#### Product Routes (`/api/products/`)

- ✅ `GET /api/products` - Get all products (with filters, search, pagination)
- ✅ `GET /api/products/[identifier]` - Get single product by ID or slug

#### Cart Routes (`/api/cart/`)

- ✅ `GET /api/cart` - Get user's cart
- ✅ `POST /api/cart` - Add item to cart
- ✅ `PUT /api/cart` - Update cart item quantity
- ✅ `DELETE /api/cart` - Clear cart

#### Order Routes (`/api/orders/`)

- ✅ `GET /api/orders` - Get user's orders
- ✅ `POST /api/orders` - Create new order

#### Payment Routes (`/api/payments/`)

- ✅ `POST /api/payments/create-intent` - Create Stripe payment intent

### 4. **Utilities & Helpers**

- ✅ JWT utilities (token generation/verification)
- ✅ Crypto utilities (random token generation, hashing)
- ✅ Response helpers (success/error/paginated responses)
- ✅ Async error handler
- ✅ Image upload to Cloudinary
- ✅ Email sending with Nodemailer
- ✅ Stripe integration

### 5. **Configuration**

- ✅ Database configuration
- ✅ Cloudinary configuration
- ✅ Stripe configuration
- ✅ Email configuration
- ✅ Environment variables setup

## 📋 Setup Instructions

### Step 1: Install Dependencies

Navigate to the client folder and install the new dependencies:

```bash
cd client
npm install
```

The following packages have been added to support backend functionality:

- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cloudinary` - Image uploads
- `stripe` - Payment processing
- `nodemailer` - Email sending

### Step 2: Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Fill in your environment variables in `.env.local`:

```env
# MongoDB - Your database connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secrets - Generate strong random strings
JWT_SECRET=your_very_long_random_secret_at_least_32_characters
JWT_REFRESH_SECRET=another_different_long_random_secret

# Cloudinary - Get from cloudinary.com dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe - Get from stripe.com dashboard
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email - Use Gmail or other SMTP service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Premium Marketplace

# URLs
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api

# Environment
NODE_ENV=development
```

### Step 3: Run the Application

Start the Next.js development server:

```bash
npm run dev
```

The application will run on `http://localhost:3000` with API routes accessible at `http://localhost:3000/api/*`

## 🏗️ Architecture Changes

### Before (Separate Backend)

```
┌─────────────┐         ┌──────────────────┐
│   Next.js   │ ←────→ │  Express Server  │
│   Client    │  HTTP   │   (Port 5000)    │
│ (Port 3000) │         └────────┬─────────┘
└─────────────┘                  │
                                 ↓
                          ┌──────────────┐
                          │   MongoDB    │
                          └──────────────┘
```

### After (Integrated)

```
┌───────────────────────────────┐
│         Next.js App           │
│  ┌─────────┐   ┌───────────┐ │
│  │  Pages  │   │ API Routes│ │
│  │ (Client)│   │ (Backend) │ │
│  └─────────┘   └─────┬─────┘ │
│    (Port 3000)       │        │
└─────────────────────┼────────┘
                      │
                      ↓
               ┌──────────────┐
               │   MongoDB    │
               └──────────────┘
```

## 🔄 Key Differences

### 1. **Import Statements**

**Before (CommonJS):**

```javascript
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
```

**After (ES Modules):**

```javascript
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
```

### 2. **Response Handling**

**Before (Express):**

```javascript
res.status(200).json({ status: "success", data: { user } });
```

**After (Next.js):**

```javascript
return sendSuccess({ user }, 200, "Success message");
// or
return NextResponse.json(
  { status: "success", data: { user } },
  { status: 200 },
);
```

### 3. **Request/Response Objects**

**Before (Express):**

```javascript
exports.getUser = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  // ...
};
```

**After (Next.js API Route):**

```javascript
export async function GET(request, { params }) {
  const { id } = params;
  const body = await request.json();
  // ...
}
```

### 4. **Middleware**

**Before (Express):**

```javascript
router.get("/profile", protect, authorize("admin"), getProfile);
```

**After (Next.js):**

```javascript
export async function GET(request) {
  const authCheck = await protect(request);
  if (!authCheck.authenticated) {
    return authCheck.response;
  }

  const roleCheck = authorize(authCheck.user, "admin");
  if (!roleCheck.authorized) {
    return roleCheck.response;
  }

  // Your logic here
}
```

### 5. **Cookies**

**Before (Express):**

```javascript
res.cookie("refreshToken", token, { httpOnly: true });
```

**After (Next.js):**

```javascript
response.cookies.set("refreshToken", token, { httpOnly: true });
```

## 📁 New File Structure

```
client/
├── src/
│   ├── app/
│   │   ├── api/                    # All API routes (NEW)
│   │   │   ├── auth/
│   │   │   │   ├── register/route.js
│   │   │   │   ├── login/route.js
│   │   │   │   ├── logout/route.js
│   │   │   │   ├── refresh/route.js
│   │   │   │   ├── me/route.js
│   │   │   │   ├── google/route.js
│   │   │   │   ├── forgot-password/route.js
│   │   │   │   ├── reset-password/route.js
│   │   │   │   └── verify-email/[token]/route.js
│   │   │   ├── products/
│   │   │   │   ├── route.js
│   │   │   │   └── [identifier]/route.js
│   │   │   ├── cart/
│   │   │   │   └── route.js
│   │   │   ├── orders/
│   │   │   │   └── route.js
│   │   │   └── payments/
│   │   │       └── create-intent/route.js
│   │   ├── (pages)/
│   │   │   ├── page.js
│   │   │   ├── about/
│   │   │   └── ...
│   │   └── layout.js
│   ├── models/                     # Mongoose models (NEW)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Review.js
│   │   ├── Category.js
│   │   ├── Coupon.js
│   │   └── Banner.js
│   ├── lib/                        # Backend utilities (NEW)
│   │   ├── mongodb.js              # Database connection
│   │   ├── jwt.js                  # JWT utilities
│   │   ├── crypto.js               # Crypto utilities
│   │   ├── response.js             # Response helpers
│   │   ├── asyncHandler.js         # Error handling
│   │   ├── imageUpload.js          # Cloudinary uploads
│   │   ├── email.js                # Email sending
│   │   ├── stripe.js               # Stripe config
│   │   ├── cloudinary.js           # Cloudinary config
│   │   └── utils.js                # Other utilities
│   ├── middleware/                 # Next.js middleware (NEW)
│   │   └── auth.js                 # Authentication middleware
│   ├── components/
│   ├── services/
│   │   └── api.js                  # Updated API client
│   ├── hooks/
│   └── store/
├── .env.local                      # Environment variables
├── .env.local.example              # Example env file
└── package.json                    # Updated dependencies
```

## 🚀 Remaining Migration Tasks

The following routes still need to be migrated from the old backend. You can use the existing routes as templates:

### TODO: Complete API Routes Migration

1. **Categories** - `/api/categories/`
   - GET all categories
   - POST create category (admin)
   - PUT update category (admin)
   - DELETE category (admin)

2. **Reviews** - `/api/reviews/`
   - GET product reviews
   - POST create review (authenticated)
   - PUT update review (owner)
   - DELETE review (owner/admin)

3. **Coupons** - `/api/coupons/`
   - GET all coupons (admin)
   - POST create coupon (admin)
   - POST validate coupon
   - DELETE coupon (admin)

4. **Banners** - `/api/banners/`
   - GET all banners
   - POST create banner (admin)
   - PUT update banner (admin)
   - DELETE banner (admin)

5. **Sellers** - `/api/sellers/`
   - GET seller profile
   - GET seller products
   - GET seller orders
   - PUT update seller profile

6. **Admin** - `/api/admin/`
   - GET dashboard stats
   - GET all users
   - PUT update user role
   - DELETE user

7. **User Management** - `/api/users/`
   - GET user profile
   - PUT update profile
   - PUT change password
   - POST add address
   - PUT update address
   - DELETE address
   - POST add to wishlist
   - DELETE from wishlist

### Migration Template

Use this template to create new API routes:

```javascript
// /api/your-route/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import YourModel from "@/models/YourModel";
import { protect, authorize } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request) {
  try {
    // Protect route if needed
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    // Check authorization if needed
    const roleCheck = authorize(authCheck.user, "admin");
    if (!roleCheck.authorized) {
      return roleCheck.response;
    }

    await connectDB();

    // Your logic here
    const data = await YourModel.find();

    return sendSuccess({ data });
  } catch (error) {
    console.error("Error:", error);
    return sendError(error.message || "Operation failed", 500);
  }
}

export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const body = await request.json();

    // Your logic here
    const data = await YourModel.create(body);

    return sendSuccess({ data }, 201, "Created successfully");
  } catch (error) {
    console.error("Error:", error);
    return sendError(error.message || "Operation failed", 500);
  }
}
```

## 🔧 Testing the Migration

### 1. Test Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Products

```bash
# Get all products
curl http://localhost:3000/api/products

# Get single product
curl http://localhost:3000/api/products/[product-id-or-slug]
```

### 3. Test Cart (requires authentication)

```bash
# Get cart
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":1}'
```

## 📊 Benefits of This Migration

1. **Simplified Deployment** - Deploy as a single Next.js application
2. **Better Performance** - Edge runtime support, optimized caching
3. **Reduced Complexity** - No separate backend server to manage
4. **Improved DX** - Unified codebase, better IDE support
5. **Cost Effective** - Deploy on Vercel or similar platforms easily
6. **Better TypeScript Support** - Next.js has excellent TypeScript support

## 🚨 Important Notes

1. **Database Connection** - The MongoDB connection is cached in Next.js to prevent connection pool exhaustion
2. **Model Registration** - Models use `mongoose.models.ModelName || mongoose.model(...)` pattern to prevent recompilation in development
3. **API Routes** - All API routes are in `/src/app/api/` following Next.js 13+ App Router structure
4. **Middleware** - Authentication middleware now returns an object with response instead of calling `next()`
5. **Environment Variables** - Use `NEXT_PUBLIC_` prefix only for client-side variables

## 🔄 Reverting (If Needed)

If you need to revert to the old architecture:

1. Keep the `/server` folder intact
2. Restore the old `NEXT_PUBLIC_API_URL` in `.env.local`
3. Start both servers separately

## 📝 Next Steps

1. **Complete remaining routes** - Use the migration template above
2. **Add API rate limiting** - Implement with Next.js middleware
3. **Add API documentation** - Consider Swagger/OpenAPI
4. **Implement caching** - Use Next.js caching strategies
5. **Add logging** - Implement proper logging system
6. **Write tests** - Add unit and integration tests

## 🐛 Troubleshooting

### Issue: MongoDB Connection Errors

**Solution:** Ensure MONGODB_URI is correctly set in `.env.local` and your IP is whitelisted in MongoDB Atlas

### Issue: JWT Token Errors

**Solution:** Verify JWT_SECRET and JWT_REFRESH_SECRET are set and are at least 32 characters long

### Issue: Email Not Sending

**Solution:** For Gmail, enable "Less secure app access" or use App Passwords

### Issue: Cloudinary Upload Fails

**Solution:** Verify all Cloudinary credentials are correct in `.env.local`

### Issue: Stripe Payment Fails

**Solution:** Ensure you're using test keys in development and have correct webhook setup

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Connection Best Practices](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/)
- [Mongoose Models in Next.js](https://mongoosejs.com/docs/nextjs.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 💡 Support

For issues or questions about the migration:

1. Check the troubleshooting section above
2. Review the existing migrated routes as examples
3. Consult Next.js and Mongoose documentation

---

**Migration Status:** ✅ Core functionality migrated | 🔄 Additional routes pending
**Last Updated:** 2024
