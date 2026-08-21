const Grievance = require('../models/Grievance');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

// Defines which status transitions are allowed
const ALLOWED_TRANSITIONS = {
  Pending: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected', 'Pending'],
  Resolved: [],
  Rejected: [],
};

// @desc   Get admin dashboard statistics
// @route  GET /api/admin/dashboard
// @access Private (admin)
const getDashboard = async (req, res, next) => {
  try {
    const [total, pending, inProgress, resolved, rejected, highPriority] = await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: 'Pending' }),
      Grievance.countDocuments({ status: 'In Progress' }),
      Grievance.countDocuments({ status: 'Resolved' }),
      Grievance.countDocuments({ status: 'Rejected' }),
      Grievance.countDocuments({ priority: 'High' }),
    ]);

    const recentGrievances = await Grievance.find()
      .populate('student', 'name studentId')
      .sort({ createdAt: -1 })
      .limit(5);

    const highPriorityGrievances = await Grievance.find({ priority: 'High', status: { $nin: ['Resolved', 'Rejected'] } })
      .populate('student', 'name studentId')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentlyResolved = await Grievance.find({ status: 'Resolved' })
      .populate('student', 'name studentId')
      .sort({ updatedAt: -1 })
      .limit(5);

    return success(res, 200, 'Dashboard data fetched successfully', {
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        highPriority,
      },
      recentGrievances,
      highPriorityGrievances,
      recentlyResolved,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all grievances with search, filter, and sort
// @route  GET /api/admin/grievances
// @access Private (admin)
const getAllGrievances = async (req, res, next) => {
  try {
    const { search, status, category, priority, sort } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    let studentIds = null;
    if (search) {
      const matchingStudents = await User.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      studentIds = matchingStudents.map((s) => s._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { grievanceId: { $regex: search, $options: 'i' } },
        { student: { $in: studentIds } },
      ];
    }

    let sortOption = { createdAt: -1 }; // newest first (default)
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'priority') sortOption = { priority: -1, createdAt: -1 };

    const grievances = await Grievance.find(query)
      .populate('student', 'name email studentId department')
      .populate('assignedStaff', 'name email department')
      .sort(sortOption);

    return success(res, 200, 'Grievances fetched successfully', grievances);
  } catch (err) {
    next(err);
  }
};

// @desc   Assign a staff member to a grievance
// @route  PATCH /api/grievances/:id/assign
// @access Private (admin)
const assignStaff = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) return error(res, 400, 'staffId is required');

    const staff = await Staff.findById(staffId);
    if (!staff) return error(res, 404, 'Staff member not found');

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return error(res, 404, 'Grievance not found');

    grievance.assignedStaff = staff._id;
    await grievance.save();

    const populated = await grievance.populate('assignedStaff', 'name email department');

    return success(res, 200, 'Staff assigned successfully', populated);
  } catch (err) {
    next(err);
  }
};

// @desc   Update grievance status
// @route  PATCH /api/grievances/:id/status
// @access Private (admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return error(res, 400, 'Invalid status value');
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return error(res, 404, 'Grievance not found');

    if (grievance.status === status) {
      return error(res, 409, `Grievance is already ${status}`);
    }

    const allowedNext = ALLOWED_TRANSITIONS[grievance.status] || [];
    if (!allowedNext.includes(status)) {
      return error(
        res,
        400,
        `Invalid status transition from "${grievance.status}" to "${status}"`
      );
    }

    grievance.status = status;
    grievance.statusHistory.push({ status, note: note ? note.trim() : '' });
    await grievance.save();

    return success(res, 200, 'Grievance status updated successfully', grievance);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete an invalid grievance
// @route  DELETE /api/admin/grievances/:id
// @access Private (admin)
const deleteGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return error(res, 404, 'Grievance not found');

    await grievance.deleteOne();

    return success(res, 200, 'Grievance deleted successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Get all staff members
// @route  GET /api/admin/staff
// @access Private (admin)
const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find().sort({ name: 1 });
    return success(res, 200, 'Staff fetched successfully', staff);
  } catch (err) {
    next(err);
  }
};

// @desc   Create a new staff member
// @route  POST /api/admin/staff
// @access Private (admin)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return error(res, 400, 'Name, email, and department are all required');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return error(res, 400, 'Please provide a valid email address');
    }

    const existing = await Staff.findOne({ email: email.toLowerCase() });
    if (existing) {
      return error(res, 409, 'A staff member with this email already exists');
    }

    const staff = await Staff.create({ name: name.trim(), email: email.toLowerCase(), department: department.trim() });

    return success(res, 201, 'Staff member created successfully', staff);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a staff member
// @route  DELETE /api/admin/staff/:id
// @access Private (admin)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return error(res, 404, 'Staff member not found');

    await staff.deleteOne();
    return success(res, 200, 'Staff member deleted successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Get logged-in admin's profile
// @route  GET /api/admin/profile
// @access Private (admin)
const getAdminProfile = async (req, res, next) => {
  try {
    const user = req.user;
    return success(res, 200, 'Admin profile fetched successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Administration',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getAllGrievances,
  assignStaff,
  updateStatus,
  deleteGrievance,
  getStaff,
  createStaff,
  deleteStaff,
  getAdminProfile,
};
