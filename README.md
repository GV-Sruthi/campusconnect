# NotesNest - Campus Connect Platform 🎓

A complete full-stack web application for college students to share notes, post announcements, find recruitment opportunities, and stay connected with campus events.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate backend files** (one-time setup)
   ```bash
   node _setup.js
   ```
   This creates all models, controllers, routes, and middleware files.

4. **Create .env file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/notesnest
   JWT_SECRET=your_super_secret_key_123456789
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Cloudinary (optional for file uploads)
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

6. **Seed database** (optional - loads sample data)
   ```bash
   npm run seed
   ```

7. **Start backend server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📊 Database Models

### User
- name, email, password (hashed)
- branch (CSE, ECE, ME, CE, EE, BT, OTHER)
- year (1-4)
- skills, interests
- role (student, club, superadmin)

### Note
- title, subject, semester, branch, unit
- pdfLink (Cloudinary)
- uploadedBy (ref: User)
- downloads, upvotes, bookmarks

### Post
- title, description
- category (announcement, lostfound, recruitment, discussion, urgent)
- author (ref: User)
- tags, upvotes, comments
- isPinned (for urgent posts)

### Event
- eventName, description, venue
- date, time, registrationLink
- postedBy (ref: User)
- category (workshop, hackathon, cultural, sports, seminar)

### Notification
- userId, message, type
- isRead, link, createdAt

## 🔐 Authentication

- JWT tokens stored in localStorage
- Access token in `Authorization: Bearer <token>` header
- Token expiry: 7 days (configurable)
- Protected routes require valid token

### Test Credentials (After Seeding)

**Student:**
- Email: `rajesh@college.com`
- Password: `password123`

**Club Admin:**
- Email: `priya@college.com`
- Password: `password123`

**Super Admin:**
- Email: `admin@college.com`
- Password: `password123`

## 📡 API Routes

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Notes
- `GET /api/notes` - Get all notes (with filters)
- `POST /api/notes` - Upload new note (protected)
- `GET /api/notes/:id` - Get note details
- `POST /api/notes/:id/upvote` - Upvote note (protected)
- `POST /api/notes/:id/bookmark` - Bookmark note (protected)
- `GET /api/notes/:id/download` - Download note

### Posts
- `GET /api/posts` - Get all posts (with category filter)
- `POST /api/posts` - Create new post (protected)
- `GET /api/posts/:id` - Get post details
- `POST /api/posts/:id/comment` - Add comment (protected)
- `DELETE /api/posts/:id` - Delete post (author/superadmin only)
- `PATCH /api/posts/:id/pin` - Pin/unpin post (club/superadmin only)
- `POST /api/posts/:id/upvote` - Upvote post (protected)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (club/superadmin only)
- `GET /api/events/:id` - Get event details

### Users
- `GET /api/users/:id` - Get public profile
- `PATCH /api/users/profile` - Update own profile (protected)
- `GET /api/users/search?skills=react&branch=CSE` - Search users

### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `PATCH /api/notifications/:id/read` - Mark as read (protected)

## 🎨 Frontend Pages

- `/login` - User login
- `/register` - User registration
- `/` - Home feed with posts
- `/notes` - Notes library
- `/notes/upload` - Upload notes
- `/notes/:id` - Note details
- `/events` - Events board
- `/posts/new` - Create new post
- `/recruitment` - Recruitment board
- `/lost-found` - Lost & Found
- `/profile/:id` - Student profile
- `/profile/edit` - Edit profile
- `/notifications` - Notification center
- `/search` - Global search

## 🛠️ Development

### Project Structure

```
notesnest/
├── backend/
│   ├── models/           (MongoDB schemas)
│   ├── controllers/      (Business logic)
│   ├── routes/           (API endpoints)
│   ├── middleware/       (Auth, upload, etc)
│   ├── server.js         (Main server file)
│   ├── seed.js           (Seed data)
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/   (Reusable React components)
    │   ├── pages/        (Page components)
    │   ├── context/      (React Context)
    │   ├── hooks/        (Custom hooks)
    │   ├── utils/        (Utilities, API calls)
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── package.json
    └── vite.config.js
```

### Scripts

**Backend:**
```bash
npm run dev      # Start dev server with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
```

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ORM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- multer - File uploads
- cloudinary - Cloud file storage
- cors - Cross-origin requests
- dotenv - Environment variables

### Frontend
- react - UI library
- react-router-dom - Client-side routing
- axios - HTTP client
- tailwindcss - CSS framework
- vite - Build tool

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with token verification
- Role-based access control (student, club, superadmin)
- CORS configuration
- Environment variables for secrets

## 📝 Sample Data

After running `npm run seed`, the database includes:

- **3 Users**: 1 student, 1 club admin, 1 superadmin
- **5 Posts**: One of each category (announcement, lost&found, recruitment, discussion, urgent)
- **3 Notes**: Different branches and semesters
- **2 Events**: Upcoming events with different categories

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify database name in URI

### Cloudinary Upload Issues
- Add Cloudinary credentials to .env
- Check API key and secret are correct
- Ensure folder permissions in Cloudinary dashboard

### CORS Errors
- Verify CLIENT_URL in backend .env
- Ensure frontend runs on configured URL
- Check browser console for specific endpoint errors

### Token Errors
- Verify JWT_SECRET matches between auth generation and verification
- Check token is being sent in Authorization header
- Ensure token hasn't expired

## 🚀 Deployment

### Backend (Heroku/Render/Railway)
1. Create account on hosting platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## 📚 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

ISC

## 👥 Contributors

Built with ❤️ for campus students

---

**Happy coding! 🎉**
