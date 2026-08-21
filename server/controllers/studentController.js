const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// @desc   Get logged-in student's profile
// @route  GET /api/students/profile
// @access Private (student)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return error(res, 404, 'User not found');
    }
    return success(res, 200, 'Profile fetched successfully', {
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

module.exports = { getProfile };
