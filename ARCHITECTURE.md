# 🏗️ Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                            │
│                                                              │
│  next-final-project/                                        │
│  ├── client/      (Next.js Frontend)                        │
│  ├── server/      (Node.js Backend)                         │
│  └── .git/        (Git Repository)                          │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ git push
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       GITHUB                                 │
│                                                              │
│  Repository: luxora-marketplace                             │
│  ├── client/                                                │
│  └── server/                                                │
│                                                              │
└───────────┬──────────────────────────────┬───────────────────┘
            │                              │
            │                              │
  ┌─────────▼──────────┐        ┌─────────▼──────────┐
  │     VERCEL         │        │      RENDER        │
  │                    │        │                    │
  │  Deploys: client/  │        │  Deploys: server/  │
  │  Framework: Next   │        │  Runtime: Node.js  │
  │  Free Tier         │        │  Free: 750hr/mo    │
  └─────────┬──────────┘        └─────────┬──────────┘
            │                              │
            │                              │
     Frontend URL                   Backend API URL
            │                              │
https://luxora.vercel.app    https://luxora-backend.onrender.com
            │                              │
            │                              │
            └──────────┬───────────────────┘
                       │
                ┌──────▼──────┐
                │   MONGODB   │
                │    ATLAS    │
                │             │
                │ Database: team
                │ Free: 512MB │
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ImageKit │   │ Stripe  │   │  Gmail  │
   │(Images) │   │(Payment)│   │ (Email) │
   └─────────┘   └─────────┘   └─────────┘
```

## Data Flow

### User Request Flow

```
User Browser
     │
     │ 1. Visit https://luxora.vercel.app
     ▼
┌──────────────┐
│   VERCEL     │ Next.js renders page
│  (Frontend)  │
└──────┬───────┘
       │
       │ 2. Fetch data from API
       ▼
┌──────────────┐
│   RENDER     │ Express handles request
│  (Backend)   │
└──────┬───────┘
       │
       │ 3. Query database
       ▼
┌──────────────┐
│   MONGODB    │ Returns data
│   ATLAS      │
└──────────────┘
```

### Image Upload Flow

```
User uploads image
     │
     ▼
Frontend (Vercel)
     │
     │ POST /api/upload
     ▼
Backend (Render)
     │
     │ Multer middleware
     ▼
ImageKit API
     │
     │ Returns URL
     ▼
MongoDB Atlas (saves URL)
     │
     ▼
Frontend displays image
```

### Payment Flow

```
User clicks "Pay"
     │
     ▼
Frontend (Vercel)
     │ Stripe.js
     │ Creates payment intent
     ▼
Backend (Render)
     │ POST /api/payment/create-intent
     │ Stripe API
     ▼
Stripe Server
     │ Confirms payment
     ▼
Backend webhook
     │ /api/payment/webhook
     │ Updates order status
     ▼
MongoDB Atlas
     │
     ▼
User receives confirmation
```

## Monorepo Structure

```
next-final-project/          ← SINGLE GITHUB REPO
│
├── client/                  ← Deployed to VERCEL
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.production      ← Frontend env vars
│   └── vercel.json          ← Vercel config
│
├── server/                  ← Deployed to RENDER
│   ├── src/
│   ├── package.json
│   ├── .env                 ← Backend env vars (not in Git)
│   └── render.yaml          ← Render config
│
├── .gitignore               ← Protects sensitive files
├── README.md
├── DEPLOYMENT.md            ← This guide
├── QUICKSTART.md
└── DEPLOYMENT_CHECKLIST.md
```

## Environment Variables Flow

### Development (Local)

```
client/.env.local
├── NEXT_PUBLIC_API_URL=http://localhost:5000/api

server/.env
├── CLIENT_URL=http://localhost:3001
├── MONGO_URI=mongodb+srv://...
└── All other secrets
```

### Production (Deployed)

```
Vercel Dashboard
├── NEXT_PUBLIC_API_URL=https://luxora-backend.onrender.com/api
├── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
└── NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

Render Dashboard
├── CLIENT_URL=https://luxora.vercel.app
├── MONGO_URI=mongodb+srv://...
├── JWT_SECRET=...
└── All backend secrets
```

## Deployment Timeline

```
Time  │ Action
──────┼─────────────────────────────────────────────────────
0:00  │ Push code to GitHub
      │
2:00  │ Configure Render (backend)
      │ ├── Connect GitHub
      │ ├── Set root directory: server/
      │ ├── Add environment variables
      │ └── Click Deploy
      │
6:00  │ Backend deployed ✓
      │ Copy URL: https://luxora-backend.onrender.com
      │
7:00  │ Configure Vercel (frontend)
      │ ├── Connect GitHub
      │ ├── Set root directory: client/
      │ ├── Add environment variables (use backend URL)
      │ └── Click Deploy
      │
10:00 │ Frontend deployed ✓
      │ Copy URL: https://luxora.vercel.app
      │
11:00 │ Update Backend CORS
      │ ├── Render → Environment
      │ ├── CLIENT_URL=https://luxora.vercel.app
      │ └── Save (auto-redeploys)
      │
14:00 │ Update MongoDB Network Access
      │ └── Allow 0.0.0.0/0
      │
15:00 │ Test Application ✓
      │ All features working!
```

## Auto-Deployment Workflow

```
You make changes
     │
     │ git add .
     │ git commit -m "New feature"
     │ git push origin main
     │
     ▼
GitHub receives push
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
Vercel detects     Render detects    (Optional)
client/ changes    server/ changes   Run tests
     │                 │                 │
     │                 │                 │
     ▼                 ▼                 ▼
Builds frontend    Builds backend    Tests pass
     │                 │                 │
     │                 │                 │
     ▼                 ▼                 ▼
Deploys to        Deploys to        Notify team
production        production
     │                 │
     │                 │
     └────────┬────────┘
              │
              ▼
     Users see updates
     (2-3 minutes total)
```

## Scaling Strategy

### Current (Free Tier)

```
Traffic: ~1000 users/day
Cost: $0/month

Vercel:  Unlimited requests
Render:  750 hours (always on for 31 days)
MongoDB: 512MB storage
```

### Growth Phase 1

```
Traffic: ~10,000 users/day
Cost: ~$25/month

Vercel:  Still free (or Pro $20)
Render:  Standard ($7) or multiple instances
MongoDB: M2 ($9)
```

### Growth Phase 2

```
Traffic: ~100,000 users/day
Cost: ~$100-200/month

Vercel:  Pro ($20)
Render:  Pro ($85) with autoscaling
MongoDB: M10 ($57) with replicas
CDN:     Cloudflare (free)
Redis:   Upstash (~$20)
```

## High Availability Setup

For production with high traffic:

```
                Load Balancer
                      │
         ┌────────────┼────────────┐
         │            │            │
    Instance 1    Instance 2   Instance 3
    (Render)      (Render)     (Render)
         │            │            │
         └────────────┼────────────┘
                      │
                 MongoDB Atlas
              (Replica Set - 3 nodes)
                      │
         ┌────────────┼────────────┐
         │            │            │
    Primary      Secondary    Secondary
    (Write)       (Read)       (Read)
```

## Monitoring Stack

```
┌─────────────────────────────────────────┐
│         Your Application                 │
│  (Vercel + Render + MongoDB)            │
└───────────┬─────────────────────────────┘
            │
            │ Logs & Metrics
            ▼
┌─────────────────────────────────────────┐
│         Monitoring Tools                 │
│                                          │
│  ├── Vercel Analytics (built-in)       │
│  ├── Render Logs (built-in)            │
│  ├── MongoDB Charts (built-in)         │
│  └── Optional: Sentry, LogRocket       │
└───────────┬─────────────────────────────┘
            │
            │ Alerts
            ▼
┌─────────────────────────────────────────┐
│         Notifications                    │
│                                          │
│  ├── Email alerts                       │
│  ├── Slack integration                  │
│  └── SMS for critical errors            │
└─────────────────────────────────────────┘
```

## Security Layers

```
User Request
     │
     ▼
┌──────────────────┐
│  Cloudflare      │  ← DDoS protection (optional)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Vercel/Render   │  ← SSL/TLS encryption
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Rate Limiting   │  ← Express rate limit
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CORS Check      │  ← CORS middleware
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  JWT Verify      │  ← JWT authentication
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Authorization   │  ← Role-based access
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Input Validate  │  ← Zod schemas
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Process Request │
└──────────────────┘
```

---

## Quick Reference

| Component | Service       | URL Pattern                | Cost             |
| --------- | ------------- | -------------------------- | ---------------- |
| Frontend  | Vercel        | `yourproject.vercel.app`   | Free             |
| Backend   | Render        | `yourproject.onrender.com` | Free             |
| Database  | MongoDB Atlas | Connection string          | Free 512MB       |
| Images    | ImageKit      | `ik.imagekit.io/yourID`    | Free 20GB        |
| Payments  | Stripe        | API                        | Free (test mode) |

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
