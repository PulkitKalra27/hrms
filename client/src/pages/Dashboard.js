"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { getCandidates } from "../services/candidateService"
import { getEmployees } from "../services/employeeService"
import { getAttendance } from "../services/attendanceService"
import { getLeaves } from "../services/leaveService"

const Dashboard = () => {
  const [stats, setStats] = useState({
    candidates: 0,
    employees: 0,
    presentToday: 0,
    pendingLeaves: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [candidatesData, employeesData, attendanceData, leavesData] = await Promise.all([
          getCandidates(),
          getEmployees(),
          getAttendance(new Date().toISOString().split("T")[0]),
          getLeaves("pending"),
        ])

        setStats({
          candidates: candidatesData.length,
          employees: employeesData.length,
          presentToday: attendanceData.filter((a) => a.status === "present").length,
          pendingLeaves: leavesData.length,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600', color: 'var(--dark-gray)' }}>
            Welcome to HR Management System
          </h2>
          <p style={{ marginBottom: '24px', color: 'var(--secondary-color)' }}>
            Here's an overview of your organization's current status
          </p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <h3>Total Candidates</h3>
              </div>
              <p className="stat-value">{stats.candidates}</p>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Total Employees</h3>
              </div>
              <p className="stat-value">{stats.employees}</p>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
                  </svg>
                </div>
                <h3>Present Today</h3>
              </div>
              <p className="stat-value">{stats.presentToday}</p>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h3>Pending Leaves</h3>
              </div>
              <p className="stat-value">{stats.pendingLeaves}</p>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export default Dashboard
