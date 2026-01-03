const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null, // null means period is ongoing
    },
    cycleLength: {
      type: Number, // calculated when cycle completes
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    symptoms: [
      {
        type: String,
      },
    ],
    mood: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if period is ongoing
periodSchema.virtual('isOngoing').get(function () {
  return this.endDate === null;
});

// Virtual to get period duration in days
periodSchema.virtual('periodDays').get(function () {
  if (!this.endDate) return null;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Ensure virtuals are included when converting to JSON
periodSchema.set('toJSON', { virtuals: true });
periodSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Period', periodSchema);
