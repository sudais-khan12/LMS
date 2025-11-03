#!/bin/bash

# Quick Deployment Script for LMS
# This script helps you deploy to production

echo "🚀 LMS Deployment Script"
echo "========================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please create .env file with:"
    echo "  - DATABASE_URL"
    echo "  - NEXTAUTH_SECRET"
    echo "  - NEXTAUTH_URL"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Build the project
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up your database (Supabase/Railway/Neon)"
echo "2. Get your DATABASE_URL"
echo "3. Run: npx prisma db push (with production DATABASE_URL)"
echo "4. Deploy to Vercel/Railway/Render"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"



