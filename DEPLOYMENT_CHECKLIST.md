# 📋 Pre-Deployment Checklist

Use this checklist to ensure everything is ready before deploying.

## ✅ Code Preparation

- [ ] All features tested locally
- [ ] Frontend runs without errors (`cd client && npm run dev`)
- [ ] Backend runs without errors (`cd server && npm run dev`)
- [ ] Database connection works
- [ ] No console errors in browser
- [ ] Build succeeds (`cd client && npm run build`)

## ✅ Environment Setup

### Backend Environment Variables

- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGO_URI` (MongoDB Atlas connection string)
- [ ] `JWT_SECRET` (32+ characters)
- [ ] `JWT_REFRESH_SECRET` (32+ characters, different from JWT_SECRET)
- [ ] `CLIENT_URL` (will update after frontend deploy)
- [ ] `IMAGEKIT_PUBLIC_KEY`
- [ ] `IMAGEKIT_PRIVATE_KEY`
- [ ] `IMAGEKIT_URL_ENDPOINT`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

### Frontend Environment Variables

- [ ] `NEXT_PUBLIC_API_URL` (will set after backend deploy)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## ✅ External Services

- [ ] **MongoDB Atlas**
  - [ ] Cluster created
  - [ ] Database user created with read/write permissions
  - [ ] Network access configured (will set to 0.0.0.0/0 later)
  - [ ] Connection string copied

- [ ] **ImageKit**
  - [ ] Account created
  - [ ] Public key copied
  - [ ] Private key copied
  - [ ] URL endpoint copied

- [ ] **Stripe**
  - [ ] Account created
  - [ ] Test mode keys copied
  - [ ] Publishable key for frontend
  - [ ] Secret key for backend

- [ ] **Email Service (Gmail/SendGrid/Resend)**
  - [ ] Account set up
  - [ ] App password generated (if Gmail)
  - [ ] SMTP credentials ready

- [ ] **Google OAuth**
  - [ ] Google Cloud project created
  - [ ] OAuth consent screen configured
  - [ ] Credentials created (OAuth 2.0 Client ID)
  - [ ] Authorized redirect URIs configured

## ✅ Git & GitHub

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Local git initialized (`git init`)
- [ ] `.gitignore` files present (root, client, server)
- [ ] No `.env` files committed (check with `git status`)
- [ ] All changes committed
- [ ] Pushed to GitHub (`git push origin main`)

## ✅ Deployment Platforms

### Render (Backend)

- [ ] Render account created
- [ ] Connected GitHub account
- [ ] Ready to create web service

### Vercel (Frontend)

- [ ] Vercel account created
- [ ] Connected GitHub account
- [ ] Ready to create project

## ✅ Security

- [ ] Strong passwords for all services
- [ ] JWT secrets are random and 32+ characters
- [ ] `.env` files listed in `.gitignore`
- [ ] No sensitive data in code
- [ ] All API keys stored in environment variables only

## ✅ Database

- [ ] Test data seeded locally
- [ ] Admin account exists (`admin@luxora.com`)
- [ ] Sample products exist
- [ ] Categories created

## 📝 Information to Have Ready

Before you start deploying, have these ready:

### MongoDB Atlas

```
Connection String: mongodb+srv://username:password@cluster.mongodb.net/team
```

### ImageKit

```
Public Key: public_xxxxxxxxxxxxx
Private Key: private_xxxxxxxxxxxxx
URL Endpoint: https://ik.imagekit.io/xxxxx
```

### Stripe

```
Publishable Key: pk_test_xxxxxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxxxxx
```

### Email (Gmail Example)

```
Email: your-email@gmail.com
App Password: xxxx xxxx xxxx xxxx
```

### Google OAuth

```
Client ID: xxxxx.apps.googleusercontent.com
Client Secret: GOxxxxx-xxxxxxxxxx
```

### JWT Secrets

Generate with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```
JWT_SECRET: ________________________________
JWT_REFRESH_SECRET: ________________________________
```

## 🚀 Deployment Order

Once everything above is checked:

1. **Deploy Backend First** (Render)
   - Copy backend URL: `https://luxora-backend.onrender.com`

2. **Deploy Frontend** (Vercel)
   - Use backend URL in environment variables
   - Copy frontend URL: `https://luxora.vercel.app`

3. **Update Backend CORS**
   - Set `CLIENT_URL` to frontend URL
   - Redeploy backend

4. **Configure MongoDB**
   - Allow access from anywhere (0.0.0.0/0)

5. **Test Everything**
   - Visit frontend URL
   - Try logging in
   - Check all features work

## ✅ Post-Deployment

After deploying:

- [ ] Frontend loads successfully
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Seller dashboard accessible
- [ ] Products display correctly
- [ ] Images load from ImageKit
- [ ] Cart functionality works
- [ ] No console errors

## 🎯 Final Check

Before announcing your app is live:

- [ ] All pages load
- [ ] No 404 errors
- [ ] Forms submit correctly
- [ ] Payments work (test mode)
- [ ] Emails send
- [ ] Mobile responsive
- [ ] SSL certificate active (https://)
- [ ] Custom domain configured (optional)

---

## 📞 Getting Help

If you get stuck:

1. Check `DEPLOYMENT.md` for troubleshooting
2. Check Render logs for backend errors
3. Check Vercel logs for frontend errors
4. Check browser console for client errors
5. Verify all environment variables are set correctly

---

**When all items are checked, you're ready to deploy! 🚀**

Start with: `QUICKSTART.md` for fastest deployment
Or: `DEPLOYMENT.md` for detailed step-by-step guide
