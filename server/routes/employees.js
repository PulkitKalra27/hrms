const express = require("express")
const router = express.Router()
const Employee = require("../models/Employee")
const auth = require("../middleware/auth")

// @route   GET api/employees
// @desc    Get all employees
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      }
    }

    const employees = await Employee.find(query).sort({ joinDate: -1 })
    res.json(employees)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/employees/:id
// @desc    Update an employee
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, role, joinDate } = req.body

    // Check if employee exists
    let employee = await Employee.findById(req.params.id)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Update employee
    employee = await Employee.findByIdAndUpdate(req.params.id, { name, email, role, joinDate }, { new: true })

    res.json(employee)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE api/employees/:id
// @desc    Delete an employee
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if employee exists
    const employee = await Employee.findById(req.params.id)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Delete employee
    await Employee.findByIdAndDelete(req.params.id)

    res.json({ message: "Employee removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
