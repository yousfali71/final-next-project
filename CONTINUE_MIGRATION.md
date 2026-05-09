# Continue Migration Guide - Step by Step

This guide will help you migrate the remaining API routes from Express to Next.js.

## 📋 Current Status

✅ **Completed (30%):** Auth, Products (partial), Cart, Orders (partial), Payments (partial)
🔄 **Remaining (70%):** Categories, Reviews, Coupons, Banners, Sellers, Admin, User Profile

---

## 🎯 Recommended Migration Order

We recommend following this order based on dependencies and importance:

### Phase 1: Essential Features (Required for MVP)

#### 1. Categories API

**Priority:** HIGH | **Time:** 30 min

Routes to create:

- `GET /api/categories` → [client/src/app/api/categories/route.js](client/src/app/api/categories/route.js)
- `GET /api/categories/:id` → [client/src/app/api/categories/[id]/route.js](client/src/app/api/categories/[id]/route.js)

**Template:**

```javascript
// client/src/app/api/categories/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    return sendSuccess({ categories });
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

📍 **Find old code at:** `server/src/controllers/productController.js` (categories functions)

#### 2. Reviews API

**Priority:** HIGH | **Time:** 45 min

Routes to create:

- `GET /api/reviews` → [client/src/app/api/reviews/route.js](client/src/app/api/reviews/route.js)
- `POST /api/reviews` → [client/src/app/api/reviews/route.js](client/src/app/api/reviews/route.js)
- `PUT /api/reviews/:id` → [client/src/app/api/reviews/[id]/route.js](client/src/app/api/reviews/[id]/route.js)
- `DELETE /api/reviews/:id` → [client/src/app/api/reviews/[id]/route.js](client/src/app/api/reviews/[id]/route.js)

📍 **Find old code at:** `server/src/controllers/reviewController.js`

#### 3. User Profile Management

**Priority:** HIGH | **Time:** 60 min

Routes to create:

- `GET /api/users/profile` → [client/src/app/api/users/profile/route.js](client/src/app/api/users/profile/route.js)
- `PUT /api/users/profile` → [client/src/app/api/users/profile/route.js](client/src/app/api/users/profile/route.js)
- `POST /api/users/addresses` → [client/src/app/api/users/addresses/route.js](client/src/app/api/users/addresses/route.js)
- `GET /api/users/wishlist` → [client/src/app/api/users/wishlist/route.js](client/src/app/api/users/wishlist/route.js)

📍 **Find old code at:** `server/src/controllers/userController.js`

### Phase 2: Enhanced Features (Important for full functionality)

#### 4. Complete Products API

**Priority:** MEDIUM | **Time:** 45 min

Routes to create:

- `POST /api/products` (create product)
- `PUT /api/products/:id` (update product)
- `DELETE /api/products/:id` (delete product)

📍 **Find old code at:** `server/src/controllers/productController.js`

#### 5. Complete Orders API

**Priority:** MEDIUM | **Time:** 30 min

Routes to create:

- `GET /api/orders/:id` (single order)
- `PUT /api/orders/:id/status` (update status)
- `PUT /api/orders/:id/cancel` (cancel order)

📍 **Find old code at:** `server/src/controllers/orderController.js`

#### 6. Coupons API

**Priority:** MEDIUM | **Time:** 45 min

Routes to create:

- `POST /api/coupons/validate` (validate coupon)
- `GET /api/coupons` (list coupons - admin)
- `POST /api/coupons` (create coupon - admin)

📍 **Find old code at:** `server/src/controllers/couponController.js`

### Phase 3: Advanced Features (Can be added later)

#### 7. Seller Dashboard

**Priority:** LOW | **Time:** 60 min

Routes to create:

- `GET /api/sellers/:id/dashboard`
- `GET /api/sellers/:id/products`
- `GET /api/sellers/:id/orders`

📍 **Find old code at:** `server/src/controllers/sellerController.js`

#### 8. Admin Dashboard

**Priority:** LOW | **Time:** 60 min

Routes to create:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`

📍 **Find old code at:** `server/src/controllers/adminController.js`

#### 9. Banners Management

**Priority:** LOW | **Time:** 30 min

Routes to create:

- `GET /api/banners`
- `POST /api/banners` (admin)

📍 **Find old code at:** `server/src/controllers/bannerController.js`

---

## 🛠️ Migration Process (For Each Route)

### Step 1: Locate Old Code

Find the Express controller in `server/src/controllers/`

### Step 2: Create New File

Create route file in `client/src/app/api/[route-name]/route.js`

### Step 3: Copy & Adapt Logic

**Transform this (Express):**

```javascript
exports.getItems = async (req, res) => {
  try {
    const items = await Model.find();
    res.status(200).json({ status: "success", data: { items } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
```

**To this (Next.js):**

```javascript
export async function GET(request) {
  try {
    await connectDB();
    const items = await Model.find();
    return sendSuccess({ items });
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

### Step 4: Handle Authentication

**Express:**

```javascript
router.get("/protected", protect, authorize("admin"), handler);
```

**Next.js:**

```javascript
export async function GET(request) {
  const authCheck = await protect(request);
  if (!authCheck.authenticated) return authCheck.response;

  const roleCheck = authorize(authCheck.user, "admin");
  if (!roleCheck.authorized) return roleCheck.response;

  // Your logic here
}
```

### Step 5: Handle Request Body

**Express:**

```javascript
const { name, email } = req.body;
```

**Next.js:**

```javascript
const { name, email } = await request.json();
```

### Step 6: Handle URL Parameters

**Express:**

```javascript
const { id } = req.params;
const { page } = req.query;
```

**Next.js:**

```javascript
// For dynamic routes: /api/items/[id]/route.js
export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
}
```

### Step 7: Test the Route

```powershell
# Test GET
curl http://localhost:3000/api/your-route

# Test POST
curl -X POST http://localhost:3000/api/your-route `
  -H "Content-Type: application/json" `
  -d '{\"key\":\"value\"}'

# Test with auth
curl http://localhost:3000/api/your-route `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 8: Update Checklist

Mark the route as complete in [API_MIGRATION_CHECKLIST.md](./API_MIGRATION_CHECKLIST.md)

---

## 📝 Common Patterns

### Pattern 1: List Items with Pagination

```javascript
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const items = await Model.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Model.countDocuments();

    return sendPaginatedResponse(items, page, limit, total);
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

### Pattern 2: Create Item (Protected)

```javascript
export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) return authCheck.response;

    await connectDB();

    const data = await request.json();
    const item = await Model.create({
      ...data,
      user: authCheck.user._id,
    });

    return sendSuccess({ item }, 201, "Created successfully");
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

### Pattern 3: Update Item (Owner/Admin Only)

```javascript
export async function PUT(request, { params }) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) return authCheck.response;

    await connectDB();

    const { id } = params;
    const item = await Model.findById(id);

    if (!item) {
      return sendError("Item not found", 404);
    }

    // Check ownership
    if (
      item.user.toString() !== authCheck.user._id.toString() &&
      authCheck.user.role !== "admin"
    ) {
      return sendError("Not authorized", 403);
    }

    const data = await request.json();
    const updated = await Model.findByIdAndUpdate(id, data, { new: true });

    return sendSuccess({ item: updated }, 200, "Updated successfully");
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

### Pattern 4: Delete Item (Admin Only)

```javascript
export async function DELETE(request, { params }) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) return authCheck.response;

    const roleCheck = authorize(authCheck.user, "admin");
    if (!roleCheck.authorized) return roleCheck.response;

    await connectDB();

    const { id } = params;
    await Model.findByIdAndDelete(id);

    return sendSuccess(null, 200, "Deleted successfully");
  } catch (error) {
    return sendError(error.message, 500);
  }
}
```

---

## ⚡ Quick Reference: Express vs Next.js

| Feature          | Express                                | Next.js API Route                         |
| ---------------- | -------------------------------------- | ----------------------------------------- |
| **Export**       | `exports.handler = ...`                | `export async function GET/POST/...`      |
| **Request body** | `req.body`                             | `await request.json()`                    |
| **URL params**   | `req.params.id`                        | `params.id` (from function args)          |
| **Query params** | `req.query.page`                       | `searchParams.get("page")`                |
| **Response**     | `res.status(200).json(...)`            | `return sendSuccess(...)`                 |
| **Cookies**      | `res.cookie(...)`                      | `response.cookies.set(...)`               |
| **Middleware**   | `router.get("/", middleware, handler)` | `const check = await middleware(request)` |

---

## 🎯 Success Metrics

Track your progress:

- [ ] Phase 1 complete (Categories, Reviews, User Profile)
- [ ] Phase 2 complete (Products CRUD, Orders CRUD, Coupons)
- [ ] Phase 3 complete (Seller Dashboard, Admin, Banners)
- [ ] All routes tested
- [ ] Frontend updated to use new routes
- [ ] Old server folder removed
- [ ] Deployed to production

---

## 🐛 Debugging Tips

### Issue: Cannot connect to database

```javascript
// Add this to see connection status
console.log("MongoDB connection state:", mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting
```

### Issue: Model not found

```javascript
// Ensure all models use this pattern
export default mongoose.models.ModelName || mongoose.model("ModelName", schema);
```

### Issue: Authentication not working

```javascript
// Debug middleware
const authCheck = await protect(request);
console.log("Auth check:", authCheck);
```

### Issue: Request body is undefined

```javascript
// Ensure you await the JSON parsing
const body = await request.json(); // ✅ Correct
const body = request.json(); // ❌ Wrong
```

---

## 📞 Need Help?

1. Check existing migrated routes for examples
2. Review [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
3. Search Next.js API routes documentation
4. Check MongoDB/Mongoose docs for database queries

---

## 🎉 When You're Done

1. Test all routes thoroughly
2. Update [API_MIGRATION_CHECKLIST.md](./API_MIGRATION_CHECKLIST.md)
3. Remove or archive the `server` folder
4. Update environment variables for production
5. Deploy to Vercel/Netlify
6. Celebrate! 🎊

---

**Good luck with your migration! You've got this! 💪**
