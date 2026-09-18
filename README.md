# 🚀 MERN Stack Hackathon Authentication Template

A clean, modular, and reusable authentication module (Frontend + Backend) designed for fast integration into any MERN stack hackathon project.

---

## 📂 Project Architecture

```
login-register-signup/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Mongoose connection utility
│   │   ├── controllers/
│   │   │   └── authController.js  # Register, Login, & GetMe handlers
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # JWT Bearer token authentication guard
│   │   ├── models/
│   │   │   └── User.js            # Mongoose User schema with bcrypt pre-save hashing
│   │   ├── routes/
│   │   │   └── authRoutes.js      # Express auth routes
│   │   ├── utils/
│   │   │   └── generateToken.js   # JWT signing helper
│   │   └── server.js              # Express app entry point
│   ├── .env.example               # Backend environment variables template
│   ├── .env                       # Local environment configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with auth interceptors
    │   ├── components/
    │   │   ├── Alert.jsx          # Reusable error & success notifications
    │   │   ├── Button.jsx         # Reusable button with spinner loading state
    │   │   └── InputField.jsx     # Reusable input with validation & show/hide password
    │   ├── context/
    │   │   └── AuthContext.jsx    # React Context with user state & auth methods
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # Protected page showing authenticated user
    │   │   ├── Login.jsx          # Login page with client validation
    │   │   └── Register.jsx       # Register page with password confirmation
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx # Route guard for private pages
    │   ├── App.jsx                # React Router setup
    │   ├── index.css              # Modern responsive CSS design system
    │   └── main.jsx
    ├── .env.example               # Frontend environment variables template
    ├── .env                       # Local frontend configuration
    ├── index.html
    └── package.json
```

---

## 📦 Required NPM Packages

### Backend Dependencies (`backend/package.json`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^4.19.2` | Fast, lightweight web framework for Node.js |
| `mongoose` | `^8.5.0` | MongoDB object modeling and schema validation |
| `bcryptjs` | `^2.4.3` | Pure JS password hashing (no native build issues) |
| `jsonwebtoken` | `^9.0.2` | Secure JWT token signing and verification |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing middleware |
| `dotenv` | `^16.4.5` | Loads environment variables from `.env` file |
| `nodemon` *(dev)* | `^3.1.4` | Automatically restarts Node server on file changes |

### Frontend Dependencies (`frontend/package.json`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^19.0.0` | React UI library |
| `react-dom` | `^19.0.0` | React DOM bindings |
| `react-router-dom`| `^7.x` | Declarative client-side routing |
| `axios` | `^1.7.x` | Promise-based HTTP client for API requests |
| `lucide-react` | `^1.16.0` | Lightweight modern icons for forms and buttons |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
# Server Port
PORT=5000

# Allowed Frontend Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Connect when ready)
MONGO_URI=mongodb://localhost:27017/hackathon_auth_db

# JWT Secret and Expiration
JWT_SECRET=super_secret_hackathon_jwt_key_2026
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env`)
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔌 API Endpoints Specification

### 1. Register User
- **Method & Path:** `POST /api/auth/register`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664b4c73...",
      "name": "Alex Rivera",
      "email": "alex@example.com",
      "createdAt": "2026-09-17T10:19:00.000Z"
    }
  }
  ```

### 2. Login User
- **Method & Path:** `POST /api/auth/login`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664b4c73...",
      "name": "Alex Rivera",
      "email": "alex@example.com",
      "createdAt": "2026-09-17T10:19:00.000Z"
    }
  }
  ```

### 3. Get Current Authenticated User
- **Method & Path:** `GET /api/auth/me`
- **Access:** Private (Requires JWT Token)
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "664b4c73...",
      "name": "Alex Rivera",
      "email": "alex@example.com",
      "createdAt": "2026-09-17T10:19:00.000Z"
    }
  }
  ```

### 4. Health Check
- **Method & Path:** `GET /api/health`
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "status": "online",
    "timestamp": "2026-09-17T10:25:00.000Z",
    "message": "MERN Auth API is running smoothly"
  }
  ```

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Run the Backend
```bash
cd backend
npm install
npm run dev
```
> The backend will start on **`http://localhost:5000`**.

### Step 2: Run the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Open your browser at **`http://localhost:5173`**.

---

## 🔌 Connecting to MongoDB (When Ready)

Per your instructions, the database is **not connected by default** so you can run, test, and copy this template immediately without running a MongoDB instance.

When you are ready to connect to a real MongoDB database:
1. Open `backend/.env` and set your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/my_app?retryWrites=true&w=majority
   ```
2. Open `backend/src/server.js` and uncomment line 32:
   ```javascript
   // Change from:
   // connectDB();

   // To:
   connectDB();
   ```
3. Restart the backend server. The Mongoose `User` model will now persist users directly to your database!

---

## 📋 Copying into Another Hackathon Project

To use this module in an existing MERN hackathon repository:
1. **Backend:**
   - Copy `backend/src/models/User.js` into your backend models folder.
   - Copy `backend/src/controllers/authController.js` into your controllers folder.
   - Copy `backend/src/middleware/authMiddleware.js` into your middleware folder.
   - Copy `backend/src/routes/authRoutes.js` into your routes folder.
   - Copy `backend/src/utils/generateToken.js` into your utils folder.
   - In your `server.js`: mount routes using `app.use('/api/auth', authRoutes);`.
2. **Frontend:**
   - Copy `frontend/src/api/axios.js` into your frontend `src/api` folder.
   - Copy `frontend/src/context/AuthContext.jsx` into your frontend `src/context` folder.
   - Copy `frontend/src/components/InputField.jsx`, `Button.jsx`, and `Alert.jsx` into your `src/components` folder.
   - Copy `frontend/src/pages/Login.jsx` and `Register.jsx` into your `src/pages` folder.
   - Wrap your app in `<AuthProvider>` and route to `<Login />` and `<Register />`.
