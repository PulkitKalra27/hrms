const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Create a schema for file metadata
const FileMetadataSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// Create a model for file metadata
const FileMetadata = mongoose.model('FileMetadata', FileMetadataSchema);

// Function to get GridFS bucket
const getGridFSBucket = (db) => {
  return new GridFSBucket(db);
};

module.exports = {
  FileMetadata,
  getGridFSBucket
};