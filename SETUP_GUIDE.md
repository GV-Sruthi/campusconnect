# NotesNest Complete Setup Guide

## 🎯 Overview

NotesNest is a full-stack campus connect platform built with:
- **Frontend**: React 19 + React Router + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + bcrypt
- **File Uploads**: Cloudinary
- **Real-time**: Socket.IO (optional)

---

## ⚡ Quick Start (Automated Setup)

### Option 1: Automatic Setup (Recommended)

If you have Python 3 installed:

```bash
# From project root
python3 setup.py
```

This will:
1. Install all backend dependencies
2. Create all backend files
3. Install all frontend dependencies
4. Create all frontend files

Then skip to "Configuration" section.

### Option 2: Manual Setup

---

## 🔧 Manual Setup Instructions

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [Atlas Cloud](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create backend files (one-time setup)
node _setup.js

# Create .env file (copy from example)
cp .env.example .env
```

### Step 2: Configure Backend Environment

Edit `backend/.env`:

```env
# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/notesnest

# OR MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notesnest

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_123456789
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cloudinary (Optional - for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create frontend files (one-time setup)
python3 setup_frontend.py

# Create .env file
cp .env.example .env
```

### Step 4: Configure Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application

### Prerequisites: Start MongoDB

**If using local MongoDB:**
```bash
mongod
```

**If using MongoDB Atlas (Cloud):**
- Just update MONGODB_URI in backend/.env with your connection string

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
```

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v8.0.12  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 3 (Optional): Seed Database

In a new terminal, populate database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 3 sample users (student, club admin, superadmin)
- 5 posts (one of each category)
- 3 notes (different branches)
- 2 events

---

## 📝 Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Student | rajesh@college.com | password123 |
| Club Admin | priya@college.com | password123 |
| Super Admin | admin@college.com | password123 |

---

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: See README.md for all endpoints

---

## 🔐 API Key Setup (Optional)

### Cloudinary Setup for File Uploads

1. Create free account at https://cloudinary.com
2. Go to Dashboard and note your:
   - Cloud Name
   - API Key
   - API Secret
3. Add to `backend/.env`:
   ```env
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### MongoDB Atlas Setup

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/notesnest
   ```
4. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notesnest
   ```

---

## 🗂️ Project Structure

```
notesnest/
├── README.md                 # Project overview
├── SETUP_GUIDE.md           # This file
├── setup.py                 # Automated setup script
│
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Post.js
│   │   ├── Event.js
│   │   └── Notification.js
│   │
│   ├── controllers/         # Business logic
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── posts.js
│   │   ├── events.js
│   │   ├── users.js
│   │   └── notifications.js
│   │
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── posts.js
│   │   ├── events.js
│   │   ├── users.js
│   │   └── notifications.js
│   │
│   ├── middleware/          # Auth & upload handlers
│   │   ├── auth.js
│   │   └── upload.js
│   │
│   ├── server.js            # Express app setup
│   ├── seed.js              # Sample data script
│   ├── _setup.js            # Backend file generator
│   ├── package.json
│   ├── .env                 # Configuration (local)
│   ├── .env.example         # Configuration template
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable React components
    │   │   ├── Navbar.jsx
    │   │   ├── PrivateRoute.jsx
    │   │   ├── PostCard.jsx
    │   │   └── NoteCard.jsx
    │   │
    │   ├── pages/           # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx
    │   │   └── Notes.jsx
    │   │
    │   ├── context/         # React Context
    │   │   └── AuthContext.jsx
    │   │
    │   ├── hooks/           # Custom hooks
    │   │   ├── useAuth.js
    │   │   ├── usePosts.js
    │   │   └── useNotes.js
    │   │
    │   ├── utils/           # Utilities
    │   │   └── api.js       # Axios instance
    │   │
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # React entry point
    │   └── index.css        # Global styles
    │
    ├── public/              # Static files
    ├── setup_frontend.py    # Frontend file generator
    ├── package.json
    ├── vite.config.js       # Vite configuration
    ├── .env                 # Configuration (local)
    ├── .env.example         # Configuration template
    └── .gitignore
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error**: `Error connecting to MongoDB: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running:
   ```bash
   mongod  # For local MongoDB
   ```
2. Verify MONGODB_URI in `.env` is correct
3. If using Atlas, check if IP whitelist includes your machine

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Kill process on port 5000 (Unix/Mac)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

### Dependencies Not Installing

**Error**: `npm ERR! code ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps
```

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify CLIENT_URL in `backend/.env` matches frontend URL
2. Example for local development:
   ```env
   CLIENT_URL=http://localhost:5173
   ```

### Cloudinary Upload Fails

**Error**: `Error uploading to Cloudinary`

**Solution**:
1. Verify Cloudinary credentials are correct in `.env`
2. Check internet connection
3. Ensure file size is within limits

### Frontend Won't Connect to Backend

**Error**: `Network Error` or `404 Not Found`

**Solution**:
1. Verify backend is running: http://localhost:5000/health
2. Check VITE_API_URL in `frontend/.env`
3. Verify backend PORT matches frontend configuration

---

## 📚 Commands Reference

### Backend Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Create backend files (first time)
node _setup.js
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Create frontend files (first time)
python3 setup_frontend.py
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123","branch":"CSE","year":1}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get posts
curl http://localhost:5000/api/posts

# Get user profile (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create requests for each API endpoint
3. Store tokens in environment variables
4. Test all CRUD operations

---

## 📦 Production Deployment

### Backend Deployment (Heroku/Render/Railway)

1. Set environment variables in hosting platform
2. Update `CLIENT_URL` to production frontend URL
3. Use MongoDB Atlas for database
4. Deploy branch with git push

### Frontend Deployment (Vercel/Netlify)

1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder
4. Configure environment variables in platform

---

## 🎓 Learning Path

**New to any of these?**

1. **React**: [Official Docs](https://react.dev/)
2. **Express**: [Official Docs](https://expressjs.com/)
3. **MongoDB**: [Official Docs](https://docs.mongodb.com/)
4. **Tailwind CSS**: [Official Docs](https://tailwindcss.com/)
5. **JWT**: [jwt.io](https://jwt.io/)

---

## 🤝 Contributing

Found a bug or want to add a feature?

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -am 'Add new feature'`
4. Push: `git push origin feature/your-feature`
5. Create a Pull Request

---

## 📞 Support

Need help? Check:

1. README.md - Project overview and API reference
2. Backend code comments - Implementation details
3. Frontend components - Component usage patterns
4. MongoDB docs - Database queries

---

## 📄 License

ISC - Free to use and modify

---

**Happy coding! 🎉 Start building NotesNest!**
