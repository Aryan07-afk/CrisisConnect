const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requestType: {
      type: String,
      required: true,
      enum: ['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Location of the disaster / victims
    location: {
      address: { type: String, required: true },
      area: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    // Number of people affected
    affectedCount: {
      type: Number,
      default: 1,
    },
    // Volunteer who raised the request on behalf of victims
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Volunteer assigned to handle this request
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Admin / coordinator who reviewed
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
    },
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for common queries
helpRequestSchema.index({ status: 1, priority: -1, createdAt: -1 });
helpRequestSchema.index({ priority: 1, status: 1 });

// Auto-set resolvedAt when status becomes 'resolved'
helpRequestSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
