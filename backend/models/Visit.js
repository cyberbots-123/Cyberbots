const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visit', visitSchema);