"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { loginUser, registerUser, verifyToken } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token")
      const expiryTime = localStorage.getItem("expiryTime")

      if (token && expiryTime) {
        // Check if token is expired
        if (new Date().getTime() > Number.parseInt(expiryTime)) {
          // Token expired, logout user
          logout()
        } else {
          try {
            // Verify token with backend
            const userData = await verifyToken()
            setCurrentUser(userData)
            setIsAuthenticated(true)
          } catch (error) {
            console.error("Token verification failed:", error)
            logout()
          }
        }
      }

      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Set up auto-logout when token expires
  useEffect(() => {
    if (isAuthenticated) {
      const expiryTime = localStorage.getItem("expiryTime")
      const remainingTime = Number.parseInt(expiryTime) - new Date().getTime()

      if (remainingTime > 0) {
        const logoutTimer = setTimeout(() => {
          logout()
        }, remainingTime)

        return () => clearTimeout(logoutTimer)
      }
    }
  }, [isAuthenticated])

  const login = async (email, password) => {
    try {
      const { token, user, expiresIn } = await loginUser(email, password)

      // Calculate expiry time (current time + expiresIn milliseconds)
      const expiryTime = new Date().getTime() + expiresIn

      // Store token and expiry time in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("expiryTime", expiryTime.toString())

      setCurrentUser(user)
      setIsAuthenticated(true)

      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (email, password) => {
    try {
      const { token, user, expiresIn } = await registerUser(email, password)

      // Calculate expiry time (current time + expiresIn milliseconds)
      const expiryTime = new Date().getTime() + expiresIn

      // Store token and expiry time in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("expiryTime", expiryTime.toString())

      setCurrentUser(user)
      setIsAuthenticated(true)

      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("expiryTime")
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
