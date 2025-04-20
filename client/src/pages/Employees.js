"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { getEmployees, updateEmployee, deleteEmployee } from "../services/employeeService"

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    joinDate: "",
  })

  const roles = ["Developer", "Designer", "Manager", "HR", "Tester", "Admin"]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async (search = "") => {
    try {
      setLoading(true)
      const data = await getEmployees(search)
      setEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchEmployees(searchTerm)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const openModal = (employee) => {
    setCurrentEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role || "",
      joinDate: employee.joinDate ? employee.joinDate.split("T")[0] : "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentEmployee(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await updateEmployee(currentEmployee._id, formData)
      closeModal()
      fetchEmployees(searchTerm)
    } catch (error) {
      console.error("Error updating employee:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id)
        fetchEmployees(searchTerm)
      } catch (error) {
        console.error("Error deleting employee:", error)
      }
    }
  }

  return (
    <Layout title="Employees Management">
      <div className="page-actions">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-search">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.role || "Not Assigned"}</td>
                    <td>{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}</td>
                    <td className="actions">
                      <button className="btn btn-edit" onClick={() => openModal(employee)}>
                        Edit
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDelete(employee._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No employees found
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
              <h2>Edit Employee</h2>
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
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="joinDate">Join Date</label>
                <input
                  type="date"
                  id="joinDate"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Employees
