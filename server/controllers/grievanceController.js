const Grievance = require('../models/Grievance');
const { success, error } = require('../utils/apiResponse');

// @desc   Create a new grievance (student)
// @route  POST /api/grievances
// @access Private (student)
const createGrievance = async (req, res, next) => {
  try {
    const { title, category, description, location, priority, imageUrl } = req.body;

    if (!title || !title.trim()) return error(res, 400, 'Title is required');
    if (!description || !description.trim()) return error(res, 400, 'Description is required');
    if (!location || !location.trim()) return error(res, 400, 'Location is required');

    if (!category || !Grievance.CATEGORIES.includes(category)) {
      return error(res, 400, 'Invalid category');
    }

    const finalPriority = priority || 'Medium';
    if (!Grievance.PRIORITIES.includes(finalPriority)) {
      return error(res, 400, 'Invalid priority');
    }

    const grievance = await Grievance.create({
      student: req.user._id,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      priority: finalPriority,
      imageUrl: imageUrl ? imageUrl.trim() : '',
      status: 'Pending',
    });

    return success(res, 201, 'Grievance created successfully', grievance);
  } catch (err) {
    next(err);
  }
};

// @desc   Get logged-in student's own grievances (with search/filter)
// @route  GET /api/grievances/my
// @access Private (student)
const getMyGrievances = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;

    const query = { student: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { grievanceId: { $regex: search, $options: 'i' } },
      ];
    }

    const grievances = await Grievance.find(query)
      .populate('assignedStaff', 'name email department')
      .sort({ createdAt: -1 });

    return success(res, 200, 'Grievances fetched successfully', grievances);
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single grievance by ID
// @route  GET /api/grievances/:id
// @access Private (owner student, admin, or staff-role)
const getGrievanceById = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('student', 'name email studentId department')
      .populate('assignedStaff', 'name email department');

    if (!grievance) {
      return error(res, 404, 'Grievance not found');
    }

    const isOwner = grievance.student._id.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isOwner && !isPrivileged) {
      return error(res, 403, 'Forbidden: you do not have access to this grievance');
    }

    return success(res, 200, 'Grievance fetched successfully', grievance);
  } catch (err) {
    next(err);
  }
};

// @desc   Submit feedback for a resolved grievance
// @route  POST /api/grievances/:id/feedback
// @access Private (owner student)
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!rating || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return error(res, 400, 'Rating must be a number between 1 and 5');
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return error(res, 404, 'Grievance not found');
    }

    if (grievance.student.toString() !== req.user._id.toString()) {
      return error(res, 403, 'Forbidden: you can only give feedback on your own grievance');
    }

    if (grievance.status !== 'Resolved') {
      return error(res, 400, 'Feedback can only be given after the grievance is resolved');
    }

    if (grievance.feedback && grievance.feedback.rating) {
      return error(res, 409, 'Feedback has already been submitted for this grievance');
    }

    grievance.feedback = {
      rating: ratingNum,
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
    };

    await grievance.save();

    return success(res, 200, 'Feedback submitted successfully', grievance);
  } catch (err) {
    next(err);
  }
};

module.exports = { createGrievance, getMyGrievances, getGrievanceById, submitFeedback };
