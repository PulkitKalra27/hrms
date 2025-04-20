"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import LeaveCalendar from "../components/LeaveCalendar"
import { getEmployees } from "../services/employeeService"
import {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  downloadLeaveDocument,
  uploadLeaveDocument
} from "../services/leaveService"

const Leaves = () => {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    employeeId: "",
    reason: "",
    startDate: "",
    endDate: "",
  })
  const [documentFile, setDocumentFile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [leavesData, employeesData] = await Promise.all([getLeaves(statusFilter), getEmployees()])

      // Merge leave data with employee names
      const employeeMap = {}
      employeesData.forEach((emp) => {
        employeeMap[emp._id] = emp
      })

      const mergedLeaves = leavesData.map((leave) => ({
        ...leave,
        employeeName: employeeMap[leave.employeeId]?.name || "Unknown",
        employeeEmail: employeeMap[leave.employeeId]?.email || "Unknown",
      }))

      setLeaves(mergedLeaves)
      setEmployees(employeesData)
    } catch (error) {
      console.error("Error fetching leaves data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Filter locally since we already have the data
    if (searchTerm.trim() === "") {
      fetchData()
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const openModal = () => {
    setFormData({
      employeeId: "",
      reason: "",
      startDate: "",
      endDate: "",
    })
    setDocumentFile(null)
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await applyLeave(formData, documentFile)
      closeModal()
      setDocumentFile(null)
      fetchData()
    } catch (error) {
      console.error("Error applying for leave:", error)
      // Display error message to the user
      alert(error.message || "Failed to apply for leave. Make sure the employee is present today.")
    }
  }

  const handleDownloadDocument = async (id) => {
    try {
      await downloadLeaveDocument(id)
    } catch (error) {
      console.error("Error downloading document:", error)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateLeaveStatus(id, status)

      // Update local state
      setLeaves((prev) => prev.map((leave) => (leave._id === id ? { ...leave, status } : leave)))
    } catch (error) {
      console.error("Error updating leave status:", error)
    }
  }

  const filteredLeaves = searchTerm
    ? leaves.filter(
        (leave) =>
          leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : leaves

  return (
    <Layout title="Leave Management">
      <div className="page-actions">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search leaves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-search">
            Search
          </button>
        </form>

        <button className="btn btn-primary" onClick={openModal}>
          Apply for Leave
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading leaves data...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reason</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.employeeName}</td>
                    <td>{leave.reason}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className={`status-${leave.status}`}>{leave.status}</td>
                    <td>
                      {leave.docURL && (
                        <button
                          className="btn btn-download"
                          onClick={() => handleDownloadDocument(leave._id)}
                          title="Download Document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download
                        </button>
                      )}
                      {!leave.docURL && (
                        <span className="text-muted">No document</span>
                      )}
                    </td>
                    <td className="actions">
                      {leave.status === "pending" && (
                        <>
                          <button className="btn btn-approve" onClick={() => handleStatusUpdate(leave._id, "approved")}>
                            Approve
                          </button>
                          <button className="btn btn-reject" onClick={() => handleStatusUpdate(leave._id, "rejected")}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No leaves found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Calendar Section */}
      <LeaveCalendar />

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Apply for Leave</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="employeeId">Employee</label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="document">Supporting Document (Optional)</label>
                <input
                  type="file"
                  id="document"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
                {documentFile && (
                  <div className="file-info">
                    <p>Selected file: {documentFile.name}</p>
                    <small>{Math.round(documentFile.size / 1024)} KB</small>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Leaves
