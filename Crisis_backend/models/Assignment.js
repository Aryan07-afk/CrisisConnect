const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'in_progress', 'completed', 'rejected'],
      default: 'assigned',
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate active assignments for same request+volunteer
assignmentSchema.index({ request: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
