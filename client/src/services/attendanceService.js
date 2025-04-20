import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance with auth header
const authAxios = axios.create({
  baseURL: API_URL,
})

// Add auth token to requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export const getAttendance = async (date = "") => {
  try {
    const response = await authAxios.get(`${API_URL}/attendance${date ? `?date=${date}` : ""}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch attendance" }
  }
}

export const getCurrentEmployees = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/attendance/current-employees`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch current employees" }
  }
}

export const recordAttendance = async (attendanceData) => {
  try {
    const response = await authAxios.post(`${API_URL}/attendance`, attendanceData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to record attendance" }
  }
}
