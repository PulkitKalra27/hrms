"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  promoteCandidate,
  uploadResume,
  downloadResume,
} from "../services/candidateService"

const Candidates = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentCandidate, setCurrentCandidate] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async (search = "") => {
    try {
      setLoading(true)
      const data = await getCandidates(search)
      setCandidates(data)
    } catch (error) {
      console.error("Error fetching candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCandidates(searchTerm)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const openModal = (candidate = null) => {
    if (candidate) {
      setCurrentCandidate(candidate)
      setFormData({
        name: candidate.name,
        email: candidate.email,
      })
    } else {
      setCurrentCandidate(null)
      setFormData({
        name: "",
        email: "",
      })
      setResumeFile(null)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentCandidate(null)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (currentCandidate) {
        // If updating an existing candidate
        await updateCandidate(currentCandidate._id, formData)
        
        // If a new resume file was selected, upload it
        if (resumeFile) {
          await uploadResume(currentCandidate._id, resumeFile)
        }
      } else {
        // If creating a new candidate
        await createCandidate(formData, resumeFile)
      }

      closeModal()
      setResumeFile(null)
      fetchCandidates(searchTerm)
    } catch (error) {
      console.error("Error saving candidate:", error)
    }
  }

  const handleDownloadResume = async (id) => {
    try {
      await downloadResume(id)
    } catch (error) {
      console.error("Error downloading resume:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate(id)
        fetchCandidates(searchTerm)
      } catch (error) {
        console.error("Error deleting candidate:", error)
      }
    }
  }

  const handlePromote = async (id) => {
    if (window.confirm("Are you sure you want to promote this candidate to employee?")) {
      try {
        await promoteCandidate(id)
        fetchCandidates(searchTerm)
      } catch (error) {
        console.error("Error promoting candidate:", error)
      }
    }
  }

  return (
    <Layout title="Candidates Management">
      <div className="page-actions">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-search">
            Search
          </button>
        </form>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Add New Candidate
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading candidates...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate._id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.status}</td>
                    <td>
                      {candidate.resume && (
                        <button
                          className="btn btn-download"
                          onClick={() => handleDownloadResume(candidate._id)}
                          title="Download Resume as PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download Resume
                        </button>
                      )}
                      {!candidate.resume && (
                        <span className="text-muted">No resume</span>
                      )}
                    </td>
                    <td className="actions">
                      <button className="btn btn-edit" onClick={() => openModal(candidate)}>
                        Edit
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDelete(candidate._id)}>
                        Delete
                      </button>
                      {candidate.status === "pending" && (
                        <button className="btn btn-promote" onClick={() => handlePromote(candidate._id)}>
                          Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentCandidate ? "Edit Candidate" : "Add New Candidate"}</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume (PDF only)</label>
                <input
                  type="file"
                  id="resume"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                {currentCandidate && currentCandidate.resume && !resumeFile && (
                  <div className="file-info">
                    <p>Current resume: {currentCandidate.resume.split('/').pop()}</p>
                    <small>Upload a new file to replace the current resume</small>
                  </div>
                )}
                {resumeFile && (
                  <div className="file-info">
                    <p>Selected file: {resumeFile.name}</p>
                    <small>{Math.round(resumeFile.size / 1024)} KB</small>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentCandidate ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Candidates
