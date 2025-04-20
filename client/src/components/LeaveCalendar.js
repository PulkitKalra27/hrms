import { useState, useEffect } from "react"
import { getLeaves } from "../services/leaveService"
import "./LeaveCalendar.css"

const LeaveCalendar = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  useEffect(() => {
    fetchApprovedLeaves()
  }, [])

  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth, leaves])

  const fetchApprovedLeaves = async () => {
    try {
      setLoading(true)
      const data = await getLeaves("approved")
      setLeaves(data)
    } catch (error) {
      console.error("Error fetching approved leaves:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1)
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()
    
    // Calculate the number of days in the previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    // Calculate the number of days in the current month
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(year, month - 1, day)
      days.push({
        date,
        day,
        currentMonth: false,
        leaves: getLeavesForDate(date)
      })
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        day: i,
        currentMonth: true,
        leaves: getLeavesForDate(date)
      })
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        day: i,
        currentMonth: false,
        leaves: getLeavesForDate(date)
      })
    }
    
    setCalendarDays(days)
  }

  const getLeavesForDate = (date) => {
    // Filter leaves that include this date
    return leaves.filter(leave => {
      const startDate = new Date(leave.startDate)
      const endDate = new Date(leave.endDate)
      
      // Reset time part for accurate date comparison
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      
      return compareDate >= startDate && compareDate <= endDate
    })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="leave-calendar">
      <div className="calendar-header">
        <h3>Leave Calendar</h3>
        <div className="calendar-navigation">
          <button onClick={prevMonth} className="btn btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span className="current-month">{formatMonth(currentMonth)}</span>
          <button onClick={nextMonth} className="btn btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading calendar...</div>
      ) : (
        <div className="calendar-grid">
          {/* Weekday headers */}
          {weekdays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${day.currentMonth ? 'current-month' : 'other-month'} ${day.leaves.length > 0 ? 'has-leaves' : ''}`}
            >
              <div className="day-number">{day.day}</div>
              {day.leaves.length > 0 && (
                <div className="day-leaves">
                  {day.leaves.map((leave, i) => (
                    <div key={i} className="leave-indicator" title={`${leave.employeeName}: ${leave.reason}`}>
                      {leave.employeeName?.split(' ')[0] || 'Employee'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeaveCalendar