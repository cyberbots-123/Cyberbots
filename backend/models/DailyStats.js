const mongoose = require('mongoose');

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: String,       // format: "2026-09-16"
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  sessionIds: {
    type: [String],     // sessionIds already counted today, to avoid double-counting
    default: []
  }
});

module.exports = mongoose.model('DailyStats', dailyStatsSchema);