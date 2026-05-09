# Post-Migration Setup Checklist

Use this checklist to ensure your migration is complete and working correctly.

## ✅ Phase 1: Initial Setup

### Environment Configuration

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Set `MONGODB_URI` with your MongoDB connection string
- [ ] Generate and set `JWT_SECRET` (minimum 32 characters)
- [ ] Generate and set `JWT_REFRESH_SECRET` (minimum 32 characters)
- [ ] Configure Cloudinary credentials (`CLOUDINARY_*`)
- [ ] Configure Stripe keys (`STRIPE_*`)
- [ ] Configure email settings (`EMAIL_*`)
- [ ] Verify `NEXT_PUBLIC_CLIENT_URL` is correct

### Dependencies

- [ ] Run `cd client && npm install`
- [ ] Verify all packages installed without errors
- [ ] Check for any peer dependency warnings

### Database

- [ ] MongoDB instance is running (local or Atlas)
- [ ] Database connection is successful
- [ ] IP address is whitelisted (if using MongoDB Atlas)
- [ ] Database has correct permissions

## ✅ Phase 2: Testing Core Features

### Authentication

- [ ] User registration works
- [ ] Email verification system works (check email)
- [ ] User login works
- [ ] JWT tokens are generated correctly
- [ ] Protected routes require authentication
- [ ] Logout clears tokens
- [ ] Password reset flow works
- [ ] Google OAuth works (if configured)

### Products

- [ ] Can fetch list of products
- [ ] Pagination works
- [ ] Search and filters work
- [ ] Can view single product
- [ ] Product images load correctly

### Cart

- [ ] Can add items to cart
- [ ] Can update item quantities
- [ ] Can remove items from cart
- [ ] Cart persists across page refreshes
- [ ] Cart calculations are correct

### Orders

- [ ] Can create new order
- [ ] Order reduces product stock
- [ ] Cart is cleared after order
- [ ] Can view order history
- [ ] Order details display correctly

### Payments

- [ ] Stripe payment intent creates successfully
- [ ] Payment amount is correct
- [ ] Payment confirms properly

## ✅ Phase 3: Integration Testing

### Frontend Integration

- [ ] All frontend pages load without errors
- [ ] API calls work from frontend
- [ ] Authentication state persists
- [ ] Error messages display properly
- [ ] Loading states work correctly
- [ ] Success toasts appear

### File Uploads

- [ ] Can upload images to Cloudinary
- [ ] Images display correctly
- [ ] Multiple image uploads work
- [ ] Image deletion works

### Email System

- [ ] Registration emails send
- [ ] Password reset emails send
- [ ] Order confirmation emails send
- [ ] Email templates display correctly

## ✅ Phase 4: Security & Performance

### Security

- [ ] JWT secrets are secure (32+ characters)
- [ ] Passwords are hashed
- [ ] HTTP-only cookies are set
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented (optional)
- [ ] Input validation works
- [ ] SQL injection protection (Mongoose provides this)
- [ ] XSS protection is in place

### Performance

- [ ] Database queries are optimized
- [ ] Indexes are set up on models
- [ ] API responses are fast (< 200ms for simple queries)
- [ ] Images are optimized (Cloudinary does this)
- [ ] No N+1 query issues

## ✅ Phase 5: Migration Completion

### Code Quality

- [ ] No console errors in browser
- [ ] No console errors in terminal
- [ ] All TypeScript errors resolved (if using TS)
- [ ] Code follows consistent style
- [ ] No commented-out code blocks

### Routes Migration Status

- [ ] Authentication routes (9/9) ✅
- [ ] Product routes (2/5) 🔄
- [ ] Cart routes (4/4) ✅
- [ ] Order routes (2/4) 🔄
- [ ] Payment routes (1/2) 🔄
- [ ] Category routes (0/5) ❌
- [ ] Review routes (0/5) ❌
- [ ] Coupon routes (0/5) ❌
- [ ] Banner routes (0/5) ❌
- [ ] Seller routes (0/5) ❌
- [ ] Admin routes (0/6) ❌
- [ ] User profile routes (0/8) ❌

### Documentation

- [ ] Read MIGRATION_SUMMARY.md
- [ ] Read QUICKSTART.md
- [ ] Review MIGRATION_GUIDE.md
- [ ] Check API_MIGRATION_CHECKLIST.md
- [ ] Review CONTINUE_MIGRATION.md

## ✅ Phase 6: Deployment Preparation

### Pre-Deployment

- [ ] All environment variables documented
- [ ] Production database is set up
- [ ] Production Cloudinary account configured
- [ ] Production Stripe account configured
- [ ] Production email service configured
- [ ] Build succeeds (`npm run build`)
- [ ] No build warnings
- [ ] Application runs in production mode (`npm start`)

### Deployment (Vercel/Netlify)

- [ ] Project connected to Git repository
- [ ] Environment variables set in hosting platform
- [ ] Database connection works from deployed app
- [ ] All API routes accessible
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] CORS configured for production domain

## ✅ Phase 7: Post-Deployment

### Testing in Production

- [ ] Homepage loads
- [ ] User can register
- [ ] User can login
- [ ] Products display
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Payments process successfully
- [ ] Emails send correctly
- [ ] Images upload and display

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Review server logs

### Cleanup

- [ ] Remove old server folder (after verification)
- [ ] Archive Express backend code
- [ ] Update repository README
- [ ] Update documentation
- [ ] Tag release version

## 📊 Migration Progress

Track your overall progress:

```
✅ Core Infrastructure:        100% (Complete)
✅ Authentication System:       100% (9/9 routes)
🔄 Products System:              40% (2/5 routes)
✅ Cart System:                 100% (4/4 routes)
🔄 Orders System:                50% (2/4 routes)
🔄 Payments System:              50% (1/2 routes)
❌ Categories System:             0% (0/5 routes)
❌ Reviews System:                0% (0/5 routes)
❌ Coupons System:                0% (0/5 routes)
❌ Banners System:                0% (0/5 routes)
❌ Sellers System:                0% (0/5 routes)
❌ Admin System:                  0% (0/6 routes)
❌ User Profile System:           0% (0/8 routes)

Overall Progress: 30% Complete
```

## 🎯 Next Immediate Actions

Based on this checklist, your next steps should be:

1. **If setup incomplete:** Complete Phase 1 & 2
2. **If testing incomplete:** Complete Phase 3 & 4
3. **If routes incomplete:** Follow CONTINUE_MIGRATION.md
4. **If ready to deploy:** Complete Phase 6 & 7

## 🆘 Troubleshooting

### Common Issues Checklist

- [ ] MongoDB connection string includes database name
- [ ] MongoDB Atlas IP whitelist includes your IP
- [ ] JWT secrets are at least 32 characters
- [ ] Environment file is named `.env.local` (not `.env`)
- [ ] Email service has correct SMTP settings
- [ ] Cloudinary credentials are from dashboard
- [ ] Stripe keys are for correct environment (test/production)
- [ ] Node.js version is 18+
- [ ] All npm packages installed successfully

## 📝 Notes

Use this space for migration-specific notes:

```
Date Started: _______________
Date Completed: _____________

Issues Encountered:
-
-
-

Solutions Found:
-
-
-

Custom Modifications:
-
-
-
```

---

## ✨ Success Criteria

Your migration is complete when:

- ✅ All core routes are working
- ✅ All tests pass
- ✅ Application builds without errors
- ✅ Production deployment is successful
- ✅ All features work in production

---

**Last Updated:** Check date in MIGRATION_SUMMARY.md
**Progress:** Update as you complete items
