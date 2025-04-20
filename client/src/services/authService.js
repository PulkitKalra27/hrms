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

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Login failed" }
  }
}

export const registerUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" }
  }
}

export const verifyToken = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/auth/verify`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Token verification failed" }
  }
}
