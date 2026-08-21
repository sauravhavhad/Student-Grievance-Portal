const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// @desc   Register a new student
// @route  POST /api/auth/register
// @access Public
const registerStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, password, phone, department, year } = req.body;

    if (!studentId || !name || !email || !password || !phone || !department || !year) {
      return error(res, 400, 'All fields are required');
    }

    if (!isValidEmail(email)) {
      return error(res, 400, 'Please provide a valid email address');
    }

    if (password.length < 6) {
      return error(res, 400, 'Password must be at least 6 characters long');
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return error(res, 409, 'An account with this email already exists');
    }

    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return error(res, 409, 'This student ID is already registered');
    }

    const user = await User.create({
      studentId,
      name,
      email,
      password,
      phone,
      department,
      year,
      role: 'student',
    });

    const token = generateToken(user._id, user.role);

    return success(res, 201, 'Registration successful', {
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Login (student or admin)
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return error(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return success(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Logout (stateless JWT - client discards token)
// @route  POST /api/auth/logout
// @access Private
const logout = async (req, res) => {
  return success(res, 200, 'Logged out successfully');
};

// @desc   Get currently authenticated user
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return success(res, 200, 'Current user fetched', {
      id: user._id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      year: user.year,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerStudent, login, logout, getMe };
