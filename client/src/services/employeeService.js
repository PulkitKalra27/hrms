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

export const getEmployees = async (search = "") => {
  try {
    const response = await authAxios.get(`${API_URL}/employees?search=${search}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch employees" }
  }
}

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await authAxios.put(`${API_URL}/employees/${id}`, employeeData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to update employee" }
  }
}

export const deleteEmployee = async (id) => {
  try {
    const response = await authAxios.delete(`${API_URL}/employees/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete employee" }
  }
}
