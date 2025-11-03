# 🚀 LMS Deployment Guide

Complete guide to deploy your Next.js LMS application to production with PostgreSQL database.

---

## 📋 Table of Contents

1. [Recommended Hosting Platforms](#recommended-hosting-platforms)
2. [Quick Start - Best Option (Vercel + Supabase)](#quick-start---best-option)
3. [Alternative Options](#alternative-options)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🏆 Recommended Hosting Platforms

### **Option 1: Vercel + Supabase (Recommended - Easiest)**
- ✅ **Next.js App**: Vercel (Free tier available, perfect for Next.js)
- ✅ **Database**: Supabase (Free PostgreSQL, 500MB storage)
- ✅ **Setup Time**: ~15 minutes
- ✅ **Cost**: Free for small projects
- ✅ **Best for**: Fast deployment, zero configuration

### **Option 2: Railway (All-in-One)**
- ✅ **Next.js App + Database**: Railway
- ✅ **PostgreSQL**: Included
- ✅ **Setup Time**: ~20 minutes
- ✅ **Cost**: $5/month (free $5 credit monthly)
- ✅ **Best for**: Simpler setup, everything in one place

### **Option 3: Render (Alternative)**
- ✅ **Next.js App**: Render
- ✅ **Database**: Render PostgreSQL
- ✅ **Setup Time**: ~25 minutes
- ✅ **Cost**: $7/month (free tier with limitations)
- ✅ **Best for**: Budget option with good performance

### **Option 4: AWS/DigitalOcean (Advanced)**
- ✅ **Full Control**: VPS or EC2
- ✅ **Database**: RDS or managed PostgreSQL
- ✅ **Setup Time**: 1-2 hours
- ✅ **Cost**: $10-20/month minimum
- ✅ **Best for**: Production scaling, full control

---

## ⚡ Quick Start - Best Option (Vercel + Supabase)

### Step 1: Prepare Your Codebase

```bash
# Make sure you're on the latest commit
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Set Up Supabase Database (PostgreSQL)

1. **Go to [supabase.com](https://supabase.com)**
   - Sign up for free account
   - Click "New Project"
   - Fill in:
     - **Name**: `lms-database`
     - **Database Password**: (Generate strong password - save it!)
     - **Region**: Choose closest to your users
   - Click "Create new project" (takes 2-3 minutes)

2. **Get Database Connection String**
   - Once project is ready, go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Copy the "URI" connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

3. **Run Prisma Migrations**
   ```bash
   # Install Supabase CLI (optional, or use their web UI)
   # Set DATABASE_URL environment variable
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   
   # Push your schema
   npx prisma db push
   
   # Generate Prisma Client
   npx prisma generate
   
   # Seed database (optional)
   npx prisma db seed
   ```

### Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/Login (use GitHub for easy integration)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   NEXTAUTH_SECRET=your-super-secret-key-here-generate-random-string
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   # Run this command to generate a secure secret
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live at: `https://your-app-name.vercel.app`

5. **Update NEXTAUTH_URL**
   - After deployment, update `NEXTAUTH_URL` in Vercel to your actual domain
   - Go to Settings → Environment Variables
   - Update `NEXTAUTH_URL` to your actual URL

### Step 4: Run Database Migrations on Production

After first deployment, you need to push your schema:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations (using production DATABASE_URL from Vercel)
vercel env pull .env.production
npx prisma db push --schema=./prisma/schema.prisma

# Or use Supabase SQL Editor:
# Go to Supabase → SQL Editor → Paste your Prisma migrations
```

**OR use Supabase Migration Tool:**
1. Go to Supabase Dashboard → Database → Migrations
2. Click "New Migration"
3. Run your Prisma schema SQL (convert from `prisma db push` output)

---

## 🔄 Alternative Option: Railway (All-in-One)

Railway makes it easier by hosting both app and database.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway creates database automatically
4. Copy the connection string from the database service

### Step 3: Deploy Next.js App

1. In Railway project, click "+ New"
2. Select "GitHub Repo"
3. Select your LMS repository
4. Railway auto-detects Next.js

### Step 4: Add Environment Variables

In Railway project → Variables tab:

```
DATABASE_URL=[Copy from PostgreSQL service]
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app.up.railway.app
NODE_ENV=production
```

### Step 5: Run Prisma Migrations

Railway provides a console:

1. Go to your Next.js service → Settings → "Run Command"
2. Run:
   ```bash
   npx prisma db push && npx prisma generate
   ```

### Step 6: Generate Domain

1. Go to Settings → "Generate Domain"
2. Railway gives you a free `.up.railway.app` domain
3. Update `NEXTAUTH_URL` to this domain

---

## 📝 Step-by-Step Deployment

### Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] `.env` file has all required variables
- [ ] Git repository is clean and pushed
- [ ] Database schema is finalized
- [ ] Seed data script is ready (optional)

### Required Environment Variables

Create a `.env.production` file (don't commit it):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Node Environment
NODE_ENV=production

# Optional: Email (if using email features)
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com
```

### Database Setup (Before Deployment)

1. **Create Production Database**
   - Use Supabase, Railway, Neon, or similar
   - Save the connection string

2. **Run Prisma Migrations Locally (with production DB)**
   ```bash
   # Temporarily use production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   
   # Push schema
   npx prisma db push
   
   # Generate client
   npx prisma generate
   
   # Seed (optional, for initial data)
   npm run prisma:seed
   ```

3. **Or Use Prisma Migrate (Recommended for Production)**
   ```bash
   # Create migration
   npx prisma migrate dev --name init
   
   # Apply to production
   npx prisma migrate deploy
   ```

### Build and Test Locally

```bash
# Test production build
npm run build

# Test production server
npm start

# Test on http://localhost:3000
```

---

## 🌐 Domain Configuration

### Option 1: Use Free Subdomain

- **Vercel**: `your-app.vercel.app` (automatic)
- **Railway**: `your-app.up.railway.app` (automatic)
- **Render**: `your-app.onrender.com` (automatic)

### Option 2: Custom Domain

1. **Buy Domain** (Namecheap, GoDaddy, Google Domains)
2. **Configure DNS**:
   - **Vercel**: Add domain in Settings → Domains → Configure DNS
   - **Railway**: Add custom domain in Settings → Networking
   - **Render**: Add custom domain in Settings → Custom Domains

3. **SSL Certificate** (Automatic on all platforms)
   - Vercel: Automatic
   - Railway: Automatic
   - Render: Automatic

### DNS Configuration Example

For Vercel:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment
- [ ] App loads without errors
- [ ] Login works
- [ ] Database connection successful
- [ ] All routes accessible
- [ ] Images/assets loading

### 2. Database Verification
- [ ] Run: `npx prisma studio` (locally with production DB_URL) to verify tables
- [ ] Test CRUD operations
- [ ] Verify seed data (if used)

### 3. Authentication
- [ ] Login works
- [ ] Session persists
- [ ] Logout works
- [ ] Role-based redirects work

### 4. Security
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `DATABASE_URL` is not exposed in frontend
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled (automatic on all platforms)

### 5. Performance
- [ ] Pages load quickly
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] API routes responding fast

### 6. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor database usage
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure email alerts

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Verify environment variable
echo $DATABASE_URL

# Check Prisma client
npx prisma generate
```

### Build Failures

1. **Check build logs** in hosting platform
2. **Common issues**:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies
   - Prisma client not generated

### Authentication Issues

1. **Verify NEXTAUTH_SECRET** is set
2. **Check NEXTAUTH_URL** matches your domain
3. **Clear cookies** and try again
4. **Check session storage** in database

### Migration Issues

```bash
# Reset database (DANGER: Deletes all data)
npx prisma migrate reset

# Or push schema directly
npx prisma db push

# Check migration status
npx prisma migrate status
```

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid (Starter) | Best For |
|----------|-----------|----------------|----------|
| **Vercel** | 100GB bandwidth | $20/month | Next.js apps |
| **Railway** | $5 credit/month | $5/month | Full-stack apps |
| **Render** | Limited | $7/month | Budget projects |
| **Supabase** | 500MB DB | $25/month | PostgreSQL hosting |

**Recommended Combo (Free Tier):**
- **Vercel** (App) - Free
- **Supabase** (Database) - Free (500MB)
- **Total**: $0/month for small projects

---

## 🚀 Quick Deployment Commands

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

## 💡 Pro Tips

1. **Use Prisma Migrate** instead of `db push` for production
2. **Set up CI/CD** with GitHub Actions for auto-deployment
3. **Enable database backups** on your hosting provider
4. **Monitor database size** - upgrade before hitting limits
5. **Set up staging environment** for testing before production
6. **Use environment-specific configs** (.env.production, .env.staging)

---

## 🆘 Need Help?

If you encounter issues:
1. Check platform-specific logs
2. Verify all environment variables
3. Test database connection separately
4. Check Next.js build output
5. Review Prisma migration errors

**Good luck with your deployment! 🚀**



