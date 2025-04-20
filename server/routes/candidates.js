const express = require("express")
const router = express.Router()
const Candidate = require("../models/Candidate")
const Employee = require("../models/Employee")
const { FileMetadata } = require("../models/FileStorage")
const auth = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const mongoose = require("mongoose")
const { Readable } = require("stream")

// Configure multer for resume uploads with memory storage for GridFS
const storage = multer.memoryStorage()

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new Error("Only PDF files are allowed"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Helper function to upload file to GridFS
const uploadResumeToGridFS = async (file, metadata = {}) => {
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
        metadata: {
          ...metadata,
          fileType: 'resume'
        }
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
        metadata: {
          ...metadata,
          fileType: 'resume'
        },
        fileId: fileId
      });
      
      await fileMetadata.save();
      resolve(fileId);
    });
  });
};

// @route   GET api/candidates
// @desc    Get all candidates
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 })
    res.json(candidates)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/candidates
// @desc    Create a candidate
// @access  Private
router.post("/", auth, upload.single("resume"), async (req, res) => {
  try {
    const { name, email } = req.body

    // Check if candidate already exists
    let candidate = await Candidate.findOne({ email })
    if (candidate) {
      return res.status(400).json({ message: "Candidate already exists" })
    }

    let resumeId = null;
    
    // If resume was uploaded, save it to GridFS
    if (req.file) {
      try {
        // Upload file to GridFS with metadata
        const fileId = await uploadResumeToGridFS(req.file, {
          candidateName: name,
          candidateEmail: email,
          uploadedBy: req.user.id
        });
        
        // Store the fileId as a string
        resumeId = fileId.toString();
      } catch (fileError) {
        console.error("Error uploading resume to GridFS:", fileError);
        return res.status(500).json({ message: "Failed to upload resume" });
      }
    }

    // Create new candidate
    candidate = new Candidate({
      name,
      email,
      resume: resumeId,
    })

    await candidate.save()
    res.json(candidate)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/candidates/upload/:id
// @desc    Upload resume for existing candidate
// @access  Private
router.post("/upload/:id", auth, upload.single("resume"), async (req, res) => {
  try {
    // Check if candidate exists
    let candidate = await Candidate.findById(req.params.id)
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" })
    }

    // If candidate already has a resume stored in GridFS, delete it
    if (candidate.resume && mongoose.Types.ObjectId.isValid(candidate.resume)) {
      try {
        // Delete the file from GridFS
        await global.gridFSBucket.delete(new mongoose.Types.ObjectId(candidate.resume));
        
        // Delete the metadata
        await FileMetadata.findOneAndDelete({ fileId: new mongoose.Types.ObjectId(candidate.resume) });
      } catch (deleteError) {
        console.error("Error deleting old resume:", deleteError);
        // Continue with the upload even if delete fails
      }
    }
    // If it's an old file path, try to delete it for backward compatibility
    else if (candidate.resume && candidate.resume.startsWith("/uploads/")) {
      const oldFilePath = path.join(__dirname, "..", candidate.resume)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    let resumeId = null;
    
    // Upload new resume to GridFS
    if (req.file) {
      try {
        // Upload file to GridFS with metadata
        const fileId = await uploadResumeToGridFS(req.file, {
          candidateId: candidate._id.toString(),
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          uploadedBy: req.user.id
        });
        
        // Store the fileId as a string
        resumeId = fileId.toString();
      } catch (fileError) {
        console.error("Error uploading resume to GridFS:", fileError);
        return res.status(500).json({ message: "Failed to upload resume" });
      }
    }

    // Update candidate with new resume ID
    candidate.resume = resumeId;
    await candidate.save()

    res.json(candidate)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/candidates/:id
// @desc    Update a candidate
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email } = req.body

    // Check if candidate exists
    let candidate = await Candidate.findById(req.params.id)
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" })
    }

    // Update candidate (without changing resume)
    candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    )

    res.json(candidate)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE api/candidates/:id
// @desc    Delete a candidate
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if candidate exists
    const candidate = await Candidate.findById(req.params.id)
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" })
    }

    // If candidate has a resume stored in GridFS, delete it
    if (candidate.resume && mongoose.Types.ObjectId.isValid(candidate.resume)) {
      try {
        // Delete the file from GridFS
        await global.gridFSBucket.delete(new mongoose.Types.ObjectId(candidate.resume));
        
        // Delete the metadata
        await FileMetadata.findOneAndDelete({ fileId: new mongoose.Types.ObjectId(candidate.resume) });
      } catch (deleteError) {
        console.error("Error deleting resume:", deleteError);
        // Continue with deletion even if resume delete fails
      }
    }
    // If it's an old file path, try to delete it for backward compatibility
    else if (candidate.resume && candidate.resume.startsWith("/uploads/")) {
      const resumePath = path.join(__dirname, "..", candidate.resume)
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath)
      }
    }

    // Delete candidate
    await Candidate.findByIdAndDelete(req.params.id)

    res.json({ message: "Candidate removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/candidates/:id/promote
// @desc    Promote a candidate to employee
// @access  Private
router.post("/:id/promote", auth, async (req, res) => {
  try {
    // Check if candidate exists
    const candidate = await Candidate.findById(req.params.id)
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" })
    }

    // Check if candidate is already selected
    if (candidate.status === "selected") {
      return res.status(400).json({ message: "Candidate is already selected" })
    }

    // Create new employee from candidate
    const employee = new Employee({
      name: candidate.name,
      email: candidate.email,
      joinDate: new Date(),
    })

    await employee.save()

    // Update candidate status
    candidate.status = "selected"
    await candidate.save()

    res.json({ candidate, employee })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/candidates/:id/resume
// @desc    Download candidate's resume
// @access  Private
router.get("/:id/resume", auth, async (req, res) => {
  try {
    // Check if candidate exists
    const candidate = await Candidate.findById(req.params.id)
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" })
    }

    // Check if candidate has a resume
    if (!candidate.resume) {
      return res.status(404).json({ message: "No resume found for this candidate" })
    }

    try {
      // Check if it's a valid MongoDB ObjectId (GridFS)
      if (mongoose.Types.ObjectId.isValid(candidate.resume)) {
        // Convert string ID to ObjectId
        const fileId = new mongoose.Types.ObjectId(candidate.resume);
        
        // Find file metadata
        const fileMetadata = await FileMetadata.findOne({ fileId });
        
        if (!fileMetadata) {
          return res.status(404).json({ message: "Resume metadata not found" });
        }
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.filename}"`);
        res.setHeader('Content-Type', fileMetadata.contentType);
        
        // Create download stream from GridFS
        const downloadStream = global.gridFSBucket.openDownloadStream(fileId);
        
        // Handle errors
        downloadStream.on('error', (error) => {
          console.error('Error downloading resume:', error);
          return res.status(500).json({ message: "Error downloading resume" });
        });
        
        // Pipe the file to the response
        downloadStream.pipe(res);
      }
      // For backward compatibility with file system storage
      else if (candidate.resume.startsWith("/uploads/")) {
        // Get the file path
        const resumePath = path.join(__dirname, "..", candidate.resume)
        
        // Check if file exists
        if (!fs.existsSync(resumePath)) {
          return res.status(404).json({ message: "Resume file not found" })
        }
        
        // Set headers for file download
        const filename = path.basename(resumePath)
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.setHeader('Content-Type', 'application/pdf')
        
        // Stream the file
        const fileStream = fs.createReadStream(resumePath)
        fileStream.pipe(res)
      } else {
        return res.status(404).json({ message: "Invalid resume reference" });
      }
    } catch (error) {
      console.error('Error retrieving resume:', error);
      return res.status(500).json({ message: "Error retrieving resume" });
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
