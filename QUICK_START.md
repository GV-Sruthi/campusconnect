# NotesNest - Quick Reference Guide

## 🚀 Start Here

### 1-Minute Quick Start
```bash
# Option A: Automated (if you have Python 3)
python3 setup.py

# Option B: Manual
cd backend && npm install && node _setup.js
cd ../frontend && npm install && python3 setup_frontend.py
```

### Configure Environment
```bash
# Backend - Edit backend/.env
MONGODB_URI=mongodb://localhost:27017/notesnest
JWT_SECRET=your_secret_key_here
PORT=5000

# Frontend - Already configured to http://localhost:5000/api
```

### Run Application
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend (from backend/)
npm run dev

# Terminal 3: Frontend (from frontend/)
npm run dev

# Terminal 4: Optional - Seed Database (from backend/)
npm run seed
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api

---

## 👤 Test Credentials (After Seeding)

```
Student:
  Email: rajesh@college.com
  Password: password123

Club Admin:
  Email: priya@college.com
  Password: password123

SuperAdmin:
  Email: admin@college.com
  Password: password123
```

---

## 📍 File Locations

### Backend Entry Points
```
backend/
├── server.js          ← Start here
├── seed.js            ← Run: npm run seed
├── _setup.js          ← Run: node _setup.js
├── models/            ← Database schemas
├── controllers/       ← Business logic
├── routes/            ← API endpoints
├── middleware/        ← Auth & upload
└── .env               ← Configuration
```

### Frontend Entry Points
```
frontend/
├── src/
│   ├── main.jsx       ← Entry point
│   ├── App.jsx        ← Routes & layout
│   ├── context/       ← State management
│   ├── hooks/         ← Custom hooks
│   ├── components/    ← Reusable UI
│   ├── pages/         ← Page components
│   └── utils/         ← API client
└── .env               ← Configuration
```

---

## 🎨 Main Pages

- `/login` - Login form
- `/register` - Registration form
- `/` - Main feed (posts)
- `/notes` - Notes library
- `/events` - Events board

---

## 🔌 API Endpoints Quick Reference

### Auth
```
POST   /api/auth/register        Create user
POST   /api/auth/login           User login
GET    /api/auth/me              Current user (protected)
```

### Notes
```
GET    /api/notes?branch=CSE     List notes
POST   /api/notes                Upload note (protected)
GET    /api/notes/:id            Get note
POST   /api/notes/:id/upvote     Upvote (protected)
POST   /api/notes/:id/bookmark   Bookmark (protected)
GET    /api/notes/:id/download   Download link
```

### Posts
```
GET    /api/posts?category=urgent      List posts
POST   /api/posts                      Create post (protected)
GET    /api/posts/:id                  Get post
POST   /api/posts/:id/comment          Add comment (protected)
DELETE /api/posts/:id                  Delete post (protected)
PATCH  /api/posts/:id/pin              Pin/unpin (club/admin only)
POST   /api/posts/:id/upvote           Upvote (protected)
```

### Events
```
GET    /api/events         List events
POST   /api/events         Create event (club/admin only)
GET    /api/events/:id     Get event
```

### Users
```
GET    /api/users/:id                   Get profile
PATCH  /api/users/profile               Update profile (protected)
GET    /api/users/search?branch=CSE    Search users
```

### Notifications
```
GET    /api/notifications               Get user notifications (protected)
PATCH  /api/notifications/:id/read     Mark as read (protected)
```

---

## 🔧 Common Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm start            # Start production server
npm run seed         # Seed database
node _setup.js       # Generate files
```

### Frontend
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build production
npm run preview      # Preview build
npm run lint         # Run linter
python3 setup_frontend.py  # Generate files
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` | Start MongoDB: `mongod` |
| `EADDRINUSE` | Port in use - change PORT in .env |
| `Cannot find module` | Run `npm install` again |
| `CORS error` | Check CLIENT_URL in backend/.env |
| `401 Unauthorized` | Token expired - login again |
| `Cannot upload file` | Set Cloudinary credentials |

---

## 📊 Database Collections

After seeding:
- **Users**: 3 test accounts
- **Posts**: 5 posts (all categories)
- **Notes**: 3 notes (different branches)
- **Events**: 2 upcoming events
- **Notifications**: Empty (auto-populated)

---

## 🔒 Authentication Flow

```
1. User registers/logs in
2. Backend verifies credentials & creates JWT token
3. Frontend stores token in localStorage
4. API calls include: Authorization: Bearer <token>
5. Backend verifies token on protected routes
6. If invalid/expired, redirect to login
```

---

## 📚 Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | Frontend UI |
| Express | 4.18 | Backend server |
| MongoDB | 8.0 | Database |
| Mongoose | 8.0 | Database ORM |
| JWT | 9.1 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Tailwind | 4.3 | CSS framework |
| Vite | 8.0 | Frontend bundler |
| Cloudinary | 1.40 | File storage |

---

## 🎯 Project Statistics

- **Total Files**: 46+
- **API Routes**: 30+
- **Database Models**: 5
- **Frontend Pages**: 4+
- **React Components**: 4+
- **Custom Hooks**: 3
- **Lines of Code**: 5000+

---

## 📖 Documentation

- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What was built
- Code comments - Implementation details

---

## 🚀 Deploy to Production

### Backend
```bash
# Deploy to Heroku/Render/Railway
# Set environment variables:
MONGODB_URI=<production_atlas_url>
JWT_SECRET=<production_key>
CLIENT_URL=<production_frontend_url>
NODE_ENV=production
```

### Frontend
```bash
# Deploy to Vercel/Netlify
# Set environment variable:
VITE_API_URL=<production_backend_url>
```

---

## 💡 Tips & Best Practices

1. **Always seed DB first** - `npm run seed` creates test data
2. **Check browser console** - Most errors show up there
3. **Use Network tab** - Debug API calls easily
4. **Restart services** - When changing .env files
5. **Clear localStorage** - If tokens get corrupted
6. **Use Postman** - Test API endpoints separately

---

## 🔗 Useful Links

- MongoDB: https://www.mongodb.com/
- Express: https://expressjs.com/
- React: https://react.dev/
- Tailwind: https://tailwindcss.com/
- JWT: https://jwt.io/
- Cloudinary: https://cloudinary.com/

---

**Need help?** Check SETUP_GUIDE.md for detailed troubleshooting!

---

**Built with ❤️ - NotesNest Campus Connect Platform**
