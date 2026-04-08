const mongoose = require('mongoose');

const victimRequestSchema = new mongoose.Schema(
  {
    // Who submitted
    victim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // What they need
    needType: {
      type: String,
      required: true,
      enum: ['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'],
    },
    description: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
      index: true,
    },
    // How many people
    peopleCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Location
    location: {
      address:  { type: String, required: true },
      area:     { type: String },
      district: { type: String },
      state:    { type: String },
      landmark: { type: String },
    },
    // Processing status
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'linked', 'resolved', 'closed'],
      default: 'submitted',
      index: true,
    },
    // Linked to a HelpRequest when volunteer takes it up
    linkedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      default: null,
    },
    // Admin/coordinator notes back to victim
    responseNote: {
      type: String,
      default: '',
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for admin/coordinator listing
victimRequestSchema.index({ status: 1, urgency: -1, createdAt: -1 });

victimRequestSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('VictimRequest', victimRequestSchema);
