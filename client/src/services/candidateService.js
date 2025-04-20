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

export const getCandidates = async (search = "") => {
  try {
    const response = await authAxios.get(`${API_URL}/candidates?search=${search}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch candidates" }
  }
}

export const createCandidate = async (candidateData, resumeFile = null) => {
  try {
    // If there's a resume file, use multipart/form-data
    if (resumeFile) {
      const formData = new FormData()
      formData.append("name", candidateData.name)
      formData.append("email", candidateData.email)
      formData.append("resume", resumeFile)

      const response = await uploadAxios.post(`${API_URL}/candidates`, formData)
      return response.data
    } else {
      // Otherwise use regular JSON
      const response = await authAxios.post(`${API_URL}/candidates`, candidateData)
      return response.data
    }
  } catch (error) {
    throw error.response?.data || { message: "Failed to create candidate" }
  }
}

export const updateCandidate = async (id, candidateData) => {
  try {
    const response = await authAxios.put(`${API_URL}/candidates/${id}`, candidateData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to update candidate" }
  }
}

export const uploadResume = async (id, resumeFile) => {
  try {
    const formData = new FormData()
    formData.append("resume", resumeFile)

    const response = await uploadAxios.post(`${API_URL}/candidates/upload/${id}`, formData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload resume" }
  }
}

export const downloadResume = async (id) => {
  try {
    // Use window.open to trigger file download
    window.open(`${API_URL}/candidates/${id}/resume`, '_blank')
    return true
  } catch (error) {
    throw error.response?.data || { message: "Failed to download resume" }
  }
}

export const deleteCandidate = async (id) => {
  try {
    const response = await authAxios.delete(`${API_URL}/candidates/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete candidate" }
  }
}

export const promoteCandidate = async (id) => {
  try {
    const response = await authAxios.post(`${API_URL}/candidates/${id}/promote`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to promote candidate" }
  }
}
