# Smart'Q Frontend

A modern queue management system UI built with React.

## Features

- **Customer Interface:**
  - Landing page with hero section
  - Login with Email/Mobile and Password/OTP options
  - Dashboard with queue status and scheduled events
  - Join queue functionality
  - QR code generation for event booking
  - Project synopsis page

- **Admin Interface:**
  - Admin login
  - Dashboard with summary cards
  - Event scheduler
  - Queue management
  - Counter management
  - Analytics and reports

## Technology Stack

- React 18
- Plain CSS (no frameworks)
- qrcode.react for QR code generation
- Webpack for bundling
- Babel for transpilation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Build

To create a production build:
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── customer/     # Customer-facing components
│   │   ├── admin/        # Admin components
│   │   └── shared/       # Shared components
│   ├── styles/           # CSS files
│   ├── data/             # Mock data
│   ├── App.jsx           # Main app component
│   └── index.js          # Entry point
├── package.json
└── webpack.config.js
```

## Notes

- All data is mock/static - no real backend integration
- Navigation is state-based (no React Router)
- UI is desktop-first (1440px base width)
- Status colors: Green (Low), Yellow (Medium), Red (High)

