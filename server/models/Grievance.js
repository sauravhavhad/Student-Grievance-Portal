const mongoose = require('mongoose');

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Internet/Wi-Fi',
  'Classroom',
  'Laboratory',
  'Hostel',
  'Library',
  'Cleanliness',
  'Security',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: STATUSES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Medium',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Pending',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    feedback: {
      type: feedbackSchema,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate a unique, human-readable grievance ID before validation
grievanceSchema.pre('validate', async function (next) {
  if (!this.grievanceId) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.grievanceId = `GRV-${year}-${random}`;
  }
  // Seed initial status history on first creation
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status || 'Pending', note: 'Grievance submitted' });
  }
  next();
});

grievanceSchema.statics.CATEGORIES = CATEGORIES;
grievanceSchema.statics.PRIORITIES = PRIORITIES;
grievanceSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Grievance', grievanceSchema);
