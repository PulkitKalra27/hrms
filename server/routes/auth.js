const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    user = new User({
      email,
      password,
    })

    await user.save()

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    }

    // Sign token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
        expiresIn: 7200000, // 2 hours in milliseconds
      })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    }

    // Sign token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
        expiresIn: 7200000, // 2 hours in milliseconds
      })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/auth/verify
// @desc    Verify token & get user data
// @access  Private
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
