const express = require("express")
const mongoose = require("mongoose")
const { MongoClient } = require("mongodb")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const { getGridFSBucket } = require("./models/FileStorage")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const candidateRoutes = require("./routes/candidates")
const employeeRoutes = require("./routes/employees")
const attendanceRoutes = require("./routes/attendance")
const leaveRoutes = require("./routes/leaves")

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create subdirectories for different file types
const resumesDir = path.join(uploadsDir, "resumes");
const documentsDir = path.join(uploadsDir, "documents");

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir);
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
let db;
let gridFSBucket;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    db = mongoose.connection.db;
    gridFSBucket = getGridFSBucket(db);
    
    // Make gridFSBucket available globally
    global.gridFSBucket = gridFSBucket;
  })
  .catch((err) => console.error("MongoDB connection error:", err))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/candidates", candidateRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/leaves", leaveRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
  })
}

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
