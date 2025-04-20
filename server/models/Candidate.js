const mongoose = require("mongoose")

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resume: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "selected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Candidate", CandidateSchema)
