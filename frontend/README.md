# Smart-Q

Smart Queue Management System with Real-Time Updates and Crowd Prediction

## Overview

Smart-Q is a full-stack web application designed to manage service queues digitally. It supports real-time queue updates, role-based access (Admin and Customer), token lifecycle management (waiting → serving → completed), and simulated crowd prediction.

The system is built using:

* Frontend: React
* Backend: Node.js, Express
* Database: MongoDB
* Real-time communication: Socket.IO
* Authentication: JWT
* Email notifications: Nodemailer

---

## Features

### Customer

* Join queue digitally
* View live queue position
* Receive estimated wait time
* Real-time updates without refresh

### Admin

* Secure login (JWT-based)
* View all active queues
* Start serving a token
* Complete a token
* Real-time dashboard updates

### System

* WebSocket-based live updates
* Role-based route protection
* Simulated crowd prediction logic
* Token lifecycle management

---

## Project Structure

```
Smart-Q/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
├── ML_SETUP_GUIDE.md
└── ML_IMPLEMENTATION_SUMMARY.md
```

---

## Installation Guide

### 1. Clone Repository

```
git clone https://github.com/abhaykrishnag/Smart-Q.git
cd Smart-Q
```

---

## Backend Setup

### 1. Navigate to backend

```
cd backend
```

### 2. Install dependencies

```
npm install
```

### 3. Create .env file

Create a `.env` file inside `backend/` with the following:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartq
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 4. Start backend server

```
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

### 1. Navigate to frontend

```
cd ../frontend
```

### 2. Install dependencies

```
npm install
```

### 3. Start frontend

```
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## Authentication Flow

1. Admin logs in.
2. Backend validates credentials.
3. JWT access token is returned.
4. Token is stored in localStorage.
5. Axios attaches token to protected requests.
6. Backend verifies token using middleware.

Protected routes:

* GET /api/queue
* PUT /api/queue/:id/start
* PUT /api/queue/:id/complete

---

## Real-Time Communication

Socket.IO is used for real-time updates.

When:

* A queue is joined
* A token is started
* A token is completed

The backend emits:

```
queue:update
```

Frontend listens and updates state dynamically.

---

## Deployment Guide

### Backend Deployment (Render / Railway / VPS)

1. Set environment variables in hosting dashboard:

   * PORT
   * MONGO_URI
   * JWT_SECRET
   * EMAIL_USER
   * EMAIL_PASS

2. Ensure CORS origin is updated in `server.js`:

```js
cors({
  origin: "https://your-frontend-domain.com",
  credentials: true
})
```

3. If deploying to production, use:

```
npm start
```

instead of dev mode.

---

### Frontend Deployment (Vercel / Netlify)

1. Set build command:

```
npm run build
```

2. Set environment variable (if needed):

```
REACT_APP_API_URL=https://your-backend-url.com
```

3. Replace hardcoded backend URL in frontend with:

```js
process.env.REACT_APP_API_URL
```

---

## Current Limitations

* ML predictions are simulated, not model-driven
* No refresh token mechanism
* No automated tests
* State-based navigation instead of URL routing
* No load balancing for WebSocket scaling

---

## Conclusion

Smart-Q demonstrates a full-stack queue management system with real-time updates and authentication. Core functionality is complete and operational. With additional security hardening, ML integration, and routing improvements, it can evolve into a production-grade system.