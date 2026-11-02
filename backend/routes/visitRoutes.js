const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const DailyStats = require('../models/DailyStats');
const { getIO } = require('../socket');

function getTodayString() {
  return new Date().toISOString().split('T')[0]; // "2026-09-16"
}

// ── POST /api/visits/track ──────────────────────────────────────────────
// Logs the raw visit, and increments today's unique-visitor count only if
// this sessionId hasn't already been counted today.
router.post('/track', async (req, res) => {
  try {
    const { path, sessionId, referrer } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    // 1. Always log the raw visit event (for detailed history)
    await Visit.create({
      path,
      sessionId,
      referrer,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const today = getTodayString();

    // 2. Check if this sessionId was already counted today
    const existing = await DailyStats.findOne({ date: today, sessionIds: sessionId });

    let updated;
    if (existing) {
      // Already counted today — don't increment, just return current count
      updated = existing;
    } else {
      // New unique visitor for today — increment count and record sessionId
      updated = await DailyStats.findOneAndUpdate(
        { date: today },
        {
          $inc: { count: 1 },
          $push: { sessionIds: sessionId }
        },
        { upsert: true, new: true }
      );

      // 3. Broadcast the new count live to all connected clients
      const io = getIO();
      io.emit('todayCount', updated.count);
    }

    res.status(201).json({ success: true, todayCount: updated.count });
  } catch (err) {
    console.error('Error tracking visit:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/visits/daily-stats ─────────────────────────────────────────
// Returns the last 30 days of unique-visitor counts.
router.get('/daily-stats', async (req, res) => {
  try {
    const stats = await DailyStats.find({}, { date: 1, count: 1, _id: 0 })
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching daily stats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/visits/today ───────────────────────────────────────────────
// Returns just today's count (useful for initial page load before
// Socket.IO sends the first live update).
router.get('/today', async (req, res) => {
  try {
    const today = getTodayString();
    const stats = await DailyStats.findOne({ date: today });
    res.json({ success: true, todayCount: stats ? stats.count : 0 });
  } catch (err) {
    console.error('Error fetching today stats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;