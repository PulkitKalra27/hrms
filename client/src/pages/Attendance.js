"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { getCurrentEmployees, getAttendance, recordAttendance } from "../services/attendanceService"

const Attendance = () => {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [employeesData, attendanceData] = await Promise.all([
        getCurrentEmployees(),
        getAttendance(selectedDate)
      ])

      setEmployees(employeesData)

      // Create attendance map for quick lookup
      const attendanceMap = {}
      attendanceData.forEach((item) => {
        attendanceMap[item.employeeId] = item.status
      })

      // Merge employee data with attendance status
      const mergedData = employeesData.map((employee) => ({
        ...employee,
        attendanceStatus: attendanceMap[employee._id] || "absent",
      }))

      setAttendance(mergedData)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Filter locally since we already have the data
    if (searchTerm.trim() === "") {
      fetchData()
    } else {
      const filtered = attendance.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setAttendance(filtered)
    }
  }

  const handleStatusChange = async (employeeId, status) => {
    try {
      await recordAttendance({
        employeeId,
        date: selectedDate,
        status,
      })

      // Update local state
      setAttendance((prev) => prev.map((emp) => (emp._id === employeeId ? { ...emp, attendanceStatus: status } : emp)))
    } catch (error) {
      console.error("Error recording attendance:", error)
    }
  }

  const filteredAttendance = searchTerm
    ? attendance.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : attendance

  return (
    <Layout title="Attendance Management">
      <div className="page-actions">
        <div className="date-picker">
          <label htmlFor="attendanceDate">Select Date:</label>
          <input
            type="date"
            id="attendanceDate"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

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
        <div className="loading">Loading attendance data...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.role || "Not Assigned"}</td>
                    <td>
                      <div className="attendance-toggle">
                        <button
                          className={`btn ${employee.attendanceStatus === "present" ? "btn-present active" : "btn-present"}`}
                          onClick={() => handleStatusChange(employee._id, "present")}
                        >
                          Present
                        </button>
                        <button
                          className={`btn ${employee.attendanceStatus === "absent" ? "btn-absent active" : "btn-absent"}`}
                          onClick={() => handleStatusChange(employee._id, "absent")}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default Attendance
