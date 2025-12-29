# Smart'Q - Smart Queue Management System

A comprehensive UI-only web application for queue management with live crowd prediction and event scheduling capabilities.

## Project Overview

Smart'Q is a modern SaaS dashboard application designed to help customers and administrators manage queues efficiently. The application features real-time queue tracking, crowd prediction, event scheduling, and QR code-based booking.

## Technology Stack

### Frontend
- **React** (18.2.0) - UI framework
- **HTML5, CSS3, JavaScript** - Core web technologies
- **qrcode.react** - QR code generation
- **Webpack** - Module bundler
- **Babel** - JavaScript compiler

### Backend (Placeholder)
- **Python Flask** - Web framework
- **flask-cors** - CORS support

## Project Structure

```
Smart'Q/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── customer/    # Customer UI components
│   │   │   ├── admin/       # Admin UI components
│   │   │   └── shared/      # Shared components
│   │   ├── styles/          # CSS files
│   │   ├── data/            # Mock data
│   │   └── App.jsx          # Main application
│   └── package.json
├── backend/          # Python Flask placeholder
│   ├── routes/       # API route handlers
│   └── app.py        # Flask application
└── README.md
```

## Features

### Customer Side
1. **Landing Page** - Hero section with navigation
2. **Login** - Email/Mobile with Password/OTP options
3. **Dashboard** - Queue status and scheduled events
4. **Join Queue** - Service selection and token generation
5. **Synopsis** - Project documentation

### Admin Side
1. **Admin Login** - Simple authentication UI
2. **Dashboard** - Summary cards and quick actions
3. **Event Scheduler** - Create and manage events
4. **Queue Management** - Monitor and manage queues
5. **Counter Management** - Manage service counters
6. **Analytics** - View reports and statistics

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

### Backend Setup (Optional - Placeholder Only)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000` (mock data only)

## Design System

- **Colors:**
  - Green (#10B981) - Low crowd, Active, Success
  - Yellow (#F59E0B) - Medium crowd, Warning, Pending
  - Red (#EF4444) - High crowd, Error, Inactive

- **Typography:**
  - Headings: Poppins
  - Body: Inter

- **Layout:**
  - Desktop-first (1440px base width)
  - Responsive design with mobile support

## Important Notes

⚠️ **This is a UI-only application:**
- All data is mock/static
- No real backend integration
- No data persistence
- All functionality is visual only
- Backend is a placeholder for structural reference

## QR Code Feature

QR codes are generated for events and contain JSON data with:
- Event ID
- Event Title
- Date and Time
- Organization Type
- Location

Scanning the QR code can be used to pre-fill booking forms (UI simulation).

## License

This project is for demonstration purposes only.

