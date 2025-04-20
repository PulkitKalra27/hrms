# HRMS Dashboard

![HRMS Dashboard](https://img.shields.io/badge/HRMS-Dashboard-blue)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> A comprehensive Human Resource Management System built with MongoDB, Express, React, and Node.js

## 📋 Overview

This HRMS Dashboard provides a complete solution for managing human resources within an organization. Built with the MERN stack, it offers a robust backend API with MongoDB and a responsive React frontend.

## ✨ Key Features

- **Secure Authentication** - JWT-based with 2-hour token expiry
- **Candidate Management** - Track applicants throughout the hiring process
- **Employee Management** - Maintain comprehensive employee records
- **Attendance System** - Record and monitor employee attendance
- **Leave Management** - Process and approve leave requests
- **Responsive Design** - Optimized for desktop and mobile devices

## 🗂️ Project Structure

```
hrms-dashboard/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context for state management
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   ├── index.js        # Entry point
│   │   └── styles.css      # Global styles
│   └── package.json
│
├── server/                 # Backend Node.js/Express application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── .env.example        # Example environment variables
│   ├── index.js            # Entry point
│   └── package.json
│
└── README.md               # Project documentation
```

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

## 🚀 Getting Started

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new HR user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/verify` | Verify JWT token |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | Get all candidates |
| POST | `/api/candidates` | Create a new candidate |
| PUT | `/api/candidates/:id` | Update a candidate |
| DELETE | `/api/candidates/:id` | Delete a candidate |
| POST | `/api/candidates/:id/promote` | Promote candidate to employee |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Record employee attendance |

### Leaves
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves` | Get all leave requests |
| POST | `/api/leaves` | Apply for leave |
| PUT | `/api/leaves/:id/status` | Update leave status |

## 🌐 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add environment variables

### Frontend (Vercel)
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set root directory to `client`
4. Add environment variables
5. Deploy

## 📄 License
This project is licensed under the MIT License.
