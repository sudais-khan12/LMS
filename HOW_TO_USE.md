# 🎓 LMS - How to Create Account & Access Portals

## 📝 Quick Start Guide

### **Step 1: Create an Account**

1. **Go to Registration Page**
   - Visit: `http://localhost:3000/register`
   - Or click "Sign up" from the login page

2. **Fill in Registration Form**
   - **Name**: Your full name (first + last)
   - **Email**: Your email address (must be unique)
   - **Password**: Minimum 8 characters
   - **Confirm Password**: Must match password
   - **Accept Terms**: Check the box

3. **Choose Your Role** (Currently the frontend doesn't show role selection - use the methods below)

### **Step 2: Registration Methods**

You have **3 ways** to create an account:

#### **Option A: Via Frontend (After Update)**
The registration form will be updated to include role selection.

#### **Option B: Via API Directly (Available Now)**
Use the registration API endpoint:

**For Student:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John doendoo",
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT",
  "enrollmentNo": "ENR-2025-0002",
  "semester": 1,
  "section": "A"
}
```

**For Teacher:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "TEACHER",
  "specialization": "Computer Science",
  "contact": "+1-555-0002"
}
```

**For Admin:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin2@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

#### **Option C: Use Pre-seeded Accounts**
If you've run the seed script, you already have test accounts:

- **Admin**: `admin@example.com` / `adminpassword`
- **Teacher**: `teacher@example.com` / `teacherpassword`
- **Student**: `student@example.com` / `studentpassword`

### **Step 3: Login**

1. **Go to Login Page**
   - Visit: `http://localhost:3000/login`

2. **Enter Credentials**
   - Email: Your registered email
   - Password: Your password

3. **Click "Sign In"**
   - You'll be redirected to `/select-role`

### **Step 4: Access Your Portal**

After login, you'll see the role selection page. The system will automatically redirect you based on your account role:

- **ADMIN** → `/dashboard/admin` or `/admin`
- **TEACHER** → `/dashboard/teacher` or `/teacher`
- **STUDENT** → `/dashboard/student` or `/student`

---

## 🔐 Portal Access URLs

### **Admin Portal**
- URL: `http://localhost:3000/admin` or `http://localhost:3000/dashboard/admin`
- Access: ADMIN role only
- Features: Manage all users, courses, assignments, system settings

### **Teacher Portal**
- URL: `http://localhost:3000/teacher` or `http://localhost:3000/dashboard/teacher`
- Access: TEACHER role only
- Features: Manage your courses, assignments, view students

### **Student Portal**
- URL: `http://localhost:3000/student` or `http://localhost:3000/dashboard/student`
- Access: STUDENT role only
- Features: View courses, submit assignments, track progress

---

## ✅ Can You Access It Now?

### **YES, if:**
1. ✅ Database is set up and synced (`npm run prisma:push`)
2. ✅ Seed data is loaded (`npm run prisma:seed`)
3. ✅ Server is running (`npm run dev`)

### **Use Pre-seeded Accounts:**
1. Go to `http://localhost:3000/login`
2. Use one of these credentials:
   - **Admin**: `admin@example.com` / `adminpassword`
   - **Teacher**: `teacher@example.com` / `teacherpassword`
   - **Student**: `student@example.com` / `studentpassword`
3. After login, you'll be redirected to your portal based on role

---

## 🚧 Current Status

**Working:**
- ✅ Backend API for registration (`/api/auth/register`)
- ✅ Backend API for login (NextAuth)
- ✅ Role-based middleware protection
- ✅ Dashboard pages for all roles

**Needs Update:**
- ⚠️ Frontend registration form (not calling API yet)
- ⚠️ Frontend login form (not using NextAuth yet)
- ⚠️ Role selection page (should auto-redirect based on session)

**Next Steps:**
The frontend registration and login pages need to be connected to the backend APIs. I can update these for you if needed!

---

## 🛠️ Setup Instructions

If you haven't set up the database yet:

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema to database
npm run prisma:push

# 3. Seed with test data
npm run prisma:seed

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

---

## 📞 Need Help?

If you can't access the portals:
1. Check if the server is running (`npm run dev`)
2. Verify database connection in `.env`
3. Check browser console for errors
4. Verify NEXTAUTH_SECRET is set in `.env`

