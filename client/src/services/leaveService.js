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

// Create axios instance for file uploads
const uploadAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
})

// Add auth token to upload requests
uploadAxios.interceptors.request.use(
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

export const getLeaves = async (status = "") => {
  try {
    const response = await authAxios.get(`${API_URL}/leaves${status ? `?status=${status}` : ""}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch leaves" }
  }
}

export const applyLeave = async (leaveData, documentFile = null) => {
  try {
    // If there's a document file, use multipart/form-data
    if (documentFile) {
      const formData = new FormData()
      formData.append("employeeId", leaveData.employeeId)
      formData.append("reason", leaveData.reason)
      formData.append("startDate", leaveData.startDate)
      formData.append("endDate", leaveData.endDate)
      formData.append("document", documentFile)

      const response = await uploadAxios.post(`${API_URL}/leaves`, formData)
      return response.data
    } else {
      // Otherwise use regular JSON
      const response = await authAxios.post(`${API_URL}/leaves`, leaveData)
      return response.data
    }
  } catch (error) {
    throw error.response?.data || { message: "Failed to apply for leave" }
  }
}

export const uploadLeaveDocument = async (id, documentFile) => {
  try {
    const formData = new FormData()
    formData.append("document", documentFile)

    const response = await uploadAxios.post(`${API_URL}/leaves/${id}/document`, formData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload document" }
  }
}

export const downloadLeaveDocument = async (id) => {
  try {
    // Use window.open to trigger file download
    window.open(`${API_URL}/leaves/${id}/document`, '_blank')
    return true
  } catch (error) {
    throw error.response?.data || { message: "Failed to download document" }
  }
}

export const updateLeaveStatus = async (id, status) => {
  try {
    const response = await authAxios.put(`${API_URL}/leaves/${id}/status`, { status })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to update leave status" }
  }
}
