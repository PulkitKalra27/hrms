const express = require("express")
const router = express.Router()
const Leave = require("../models/Leave")
const Employee = require("../models/Employee")
const Attendance = require("../models/Attendance")
const { FileMetadata } = require("../models/FileStorage")
const auth = require("../middleware/auth")
const path = require("path")
const fs = require("fs")
const mongoose = require("mongoose")
const { Readable } = require("stream")

// @route   GET api/leaves
// @desc    Get all leaves
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query
    const query = {}

    if (status) {
      query.status = status
    }

    // Get leaves with employee details
    const leaves = await Leave.find(query).sort({ createdAt: -1 })
    
    // Get employee details for each leave
    const leavesWithEmployeeDetails = await Promise.all(
      leaves.map(async (leave) => {
        const employee = await Employee.findById(leave.employeeId)
        return {
          ...leave.toObject(),
          employeeName: employee ? employee.name : "Unknown",
          employeeEmail: employee ? employee.email : "Unknown"
        }
      })
    )
    
    res.json(leavesWithEmployeeDetails)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/leaves
// @desc    Apply for leave
// @access  Private
// Multer setup for GridFS file uploads
const multer = require("multer")
const storage = multer.memoryStorage() // Use memory storage for GridFS
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept only pdf, doc, docx files
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only PDF and Word documents are allowed"))
    }
  }
})

// Helper function to upload file to GridFS
const uploadFileToGridFS = async (file, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const fileId = new mongoose.Types.ObjectId();
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);

    const uploadStream = global.gridFSBucket.openUploadStreamWithId(
      fileId,
      file.originalname,
      {
        contentType: file.mimetype,
        metadata: metadata
      }
    );

    readableStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', async () => {
      // Create file metadata record
      const fileMetadata = new FileMetadata({
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        metadata: metadata,
        fileId: fileId
      });
      
      await fileMetadata.save();
      resolve(fileId);
    });
  });
};

router.post("/", auth, upload.single("document"), async (req, res) => {
  try {
    const { employeeId, reason, startDate, endDate } = req.body
    let docURL = null
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Check if employee is present today (only required for applying leave)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const leaveStartDate = new Date(startDate)
    leaveStartDate.setHours(0, 0, 0, 0)
    
    // If trying to apply leave for today, employee must be present
    if (leaveStartDate.getTime() === today.getTime()) {
      return res.status(400).json({
        message: "Cannot apply for leave on the same day"
      })
    }
    
    // For future dates, check if employee is present today
    if (leaveStartDate.getTime() > today.getTime()) {
      const attendance = await Attendance.findOne({
        employeeId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      })

      if (!attendance || attendance.status !== "present") {
        return res.status(400).json({
          message: "Only present employees can apply for leave for future dates"
        })
      }
    } else {
      // For past dates, don't allow leave application
      return res.status(400).json({
        message: "Cannot apply for leave for past dates"
      })
    }

    // If a document was uploaded, save it to GridFS
    if (req.file) {
      try {
        // Upload file to GridFS with metadata
        const fileId = await uploadFileToGridFS(req.file, {
          employeeId: employeeId,
          leaveType: 'document',
          uploadedBy: req.user.id
        });
        
        // Store the fileId as a string in docURL
        docURL = fileId.toString();
      } catch (fileError) {
        console.error("Error uploading file to GridFS:", fileError);
        return res.status(500).json({ message: "Failed to upload document" });
      }
    }

    // Create new leave
    const leave = new Leave({
      employeeId,
      reason,
      startDate,
      endDate,
      docURL,
    })

    await leave.save()
    res.json(leave)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/leaves/:id/status
// @desc    Update leave status
// @access  Private
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body

    // Check if leave exists
    const leave = await Leave.findById(req.params.id)
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" })
    }

    // Update leave status
    leave.status = status
    await leave.save()

    res.json(leave)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/leaves/:id/document
// @desc    Download leave document
// @access  Private
router.get("/:id/document", auth, async (req, res) => {
  try {
    // Check if leave exists
    const leave = await Leave.findById(req.params.id)
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" })
    }

    // Check if leave has a document
    if (!leave.docURL) {
      return res.status(404).json({ message: "No document found for this leave" })
    }

    // If the document is a URL (not a GridFS ID), redirect to it
    if (leave.docURL.startsWith('http')) {
      return res.redirect(leave.docURL)
    }

    try {
      // Check if it's a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(leave.docURL)) {
        // If not a valid ObjectId, try as a file path (for backward compatibility)
        const docPath = path.join(__dirname, "..", leave.docURL)
        
        // Check if file exists
        if (fs.existsSync(docPath)) {
          // Set headers for file download
          const filename = path.basename(docPath)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          
          // Determine content type based on file extension
          const ext = path.extname(docPath).toLowerCase()
          if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf')
          } else if (ext === '.doc' || ext === '.docx') {
            res.setHeader('Content-Type', 'application/msword')
          } else {
            res.setHeader('Content-Type', 'application/octet-stream')
          }
          
          // Stream the file
          const fileStream = fs.createReadStream(docPath)
          return fileStream.pipe(res)
        } else {
          return res.status(404).json({ message: "Document file not found" })
        }
      }
      
      // Convert string ID to ObjectId
      const fileId = new mongoose.Types.ObjectId(leave.docURL);
      
      // Find file metadata
      const fileMetadata = await FileMetadata.findOne({ fileId });
      
      if (!fileMetadata) {
        return res.status(404).json({ message: "Document metadata not found" });
      }
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.filename}"`);
      res.setHeader('Content-Type', fileMetadata.contentType);
      
      // Create download stream from GridFS
      const downloadStream = global.gridFSBucket.openDownloadStream(fileId);
      
      // Handle errors
      downloadStream.on('error', (error) => {
        console.error('Error downloading file:', error);
        return res.status(500).json({ message: "Error downloading file" });
      });
      
      // Pipe the file to the response
      downloadStream.pipe(res);
      
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ message: "Error retrieving file" });
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
