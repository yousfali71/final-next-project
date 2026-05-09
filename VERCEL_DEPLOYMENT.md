# Vercel Deployment Guide

## 🚀 Deploy Your Next.js E-commerce App to Vercel

Your app is now a single Next.js application with integrated API routes, ready for seamless Vercel deployment!

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Ready

Ensure you have all required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_refresh_secret_32_chars_min
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Premium Marketplace
NEXT_PUBLIC_CLIENT_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
```

### 2. Test Locally

```powershell
cd client
npm run build
npm start
```

### 3. Verify Build Success

- [ ] No build errors
- [ ] No TypeScript errors
- [ ] All pages load
- [ ] API routes work

---

## 🎯 Deployment Steps

### Method 1: Vercel Dashboard (Easiest)

#### Step 1: Push to GitHub

```powershell
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Migrated to Next.js API routes - ready for deployment"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/your-repo.git

# Push
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. **Important:** Set Root Directory to `client`
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy"

#### Step 3: Add Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

### Method 2: Vercel CLI (Advanced)

#### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

#### Step 2: Login

```powershell
vercel login
```

#### Step 3: Deploy

```powershell
cd client
vercel
```

Follow prompts:

- Setup and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **your-project-name**
- In which directory is your code located? **./**
- Want to override settings? **No**

#### Step 4: Add Environment Variables

```powershell
# Add each variable
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
# ... add all others

# Redeploy with env vars
vercel --prod
```

---

## ⚙️ Vercel Configuration

### Create vercel.json in client folder

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "JWT_REFRESH_SECRET": "@jwt_refresh_secret"
  }
}
```

---

## 🔒 Security for Production

### 1. Update MongoDB

**Allow Vercel IP addresses:**

- MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (all IPs) OR
- Use MongoDB Atlas's "Add Current IP Address" feature

**Better approach:** Use MongoDB connection with proper credentials and enable IP Access List with Vercel's IPs.

### 2. Update CORS (if needed)

In your API routes, ensure CORS allows your domain:

```javascript
// Already handled by Next.js, but verify NEXT_PUBLIC_CLIENT_URL is correct
```

### 3. Secure Cookies

Cookies are automatically set to secure in production by Next.js.

### 4. Environment Variables

Never commit:

- `.env.local`
- Any file with secrets

Already in .gitignore: ✅

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain in Vercel:

1. Project Settings → Domains
2. Add your domain
3. Configure DNS records (Vercel provides instructions)
4. Update `NEXT_PUBLIC_CLIENT_URL` to your domain
5. Redeploy

---

## 📊 Post-Deployment Testing

Test these endpoints:

### Health Check

```powershell
curl https://your-app.vercel.app/api/auth/me
# Should return 401 (not authenticated) - this means API is working
```

### Register User

```powershell
curl -X POST https://your-app.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"password123\"}'
```

### Get Products

```powershell
curl https://your-app.vercel.app/api/products
```

### Test in Browser

- [ ] Homepage loads
- [ ] Can register user
- [ ] Can login
- [ ] Products display
- [ ] Cart works
- [ ] Can create order
- [ ] Images load (Cloudinary)
- [ ] Emails send

---

## 🐛 Troubleshooting

### Issue: API routes return 404

**Solution:** Ensure root directory is set to `client` in Vercel settings

### Issue: Environment variables not working

**Solution:**

- Check they're added in Vercel dashboard
- Redeploy after adding env vars
- Use `process.env.VARIABLE_NAME` not `process.env.NEXT_PUBLIC_*` for server-side

### Issue: MongoDB connection fails

**Solution:**

- Whitelist `0.0.0.0/0` in MongoDB Atlas
- Verify connection string is correct
- Check MongoDB user has correct permissions

### Issue: Build fails

**Solution:**

```powershell
# Test build locally first
cd client
npm run build

# Check for errors
# Fix any issues
# Push and redeploy
```

### Issue: Images not uploading

**Solution:**

- Verify Cloudinary credentials in Vercel env vars
- Check Cloudinary account is active
- Test upload locally first

### Issue: Emails not sending

**Solution:**

- For Gmail: Use App Password, not regular password
- Check email credentials in Vercel env vars
- Verify SMTP settings

---

## 📈 Monitoring

### Vercel Analytics (Free)

Enable in Project Settings → Analytics

### View Logs

```powershell
vercel logs
```

Or in Vercel Dashboard → Deployments → View Logs

### Performance Monitoring

- Vercel Dashboard shows performance metrics
- Monitor API route response times
- Check MongoDB Atlas metrics

---

## 🔄 Continuous Deployment

Once connected to GitHub:

- Every push to `main` branch = automatic deployment
- Pull requests get preview deployments
- Automatic rollback if deployment fails

---

## 💡 Best Practices

1. **Use Environment Variables**
   - Never hardcode secrets
   - Use Vercel's environment variables

2. **Monitor Logs**
   - Check regularly for errors
   - Set up alerts

3. **Database Backups**
   - Enable MongoDB Atlas automated backups
   - Test restore procedures

4. **Update Dependencies**

   ```powershell
   npm outdated
   npm update
   ```

5. **Security Updates**
   - Monitor npm audit
   - Update packages regularly

---

## 🎯 Deployment Checklist

- [ ] Server folder removed/archived
- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Root directory set to `client`
- [ ] All environment variables added
- [ ] MongoDB IP whitelisted
- [ ] Application deploys successfully
- [ ] All API endpoints tested
- [ ] Frontend works correctly
- [ ] Images upload and display
- [ ] Emails send successfully
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled

---

## 🚀 You're Live!

Your e-commerce platform is now deployed on Vercel!

**Share your app:** `https://your-project.vercel.app`

### Next Steps:

1. Monitor initial traffic
2. Migrate remaining routes (see CONTINUE_MIGRATION.md)
3. Add more features
4. Scale as needed (Vercel handles this automatically!)

---

## 📞 Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- This project's docs: See README.md

---

**Happy Deploying! 🎉**
