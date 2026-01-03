const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

// GET all calls for a specific month
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const calls = await Call.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new call (or update existing)
router.post('/', async (req, res) => {
  try {
    const { date, startTime, duration } = req.body;

    const callDate = new Date(date);
    callDate.setHours(0, 0, 0, 0);

    // Check if call already exists for this date
    let call = await Call.findOne({
      date: {
        $gte: callDate,
        $lt: new Date(callDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (call) {
      // Update existing call
      call.startTime = startTime;
      call.duration = duration;
      await call.save();
    } else {
      // Create new call
      call = new Call({
        date: callDate,
        startTime,
        duration,
      });
      await call.save();
    }

    res.status(201).json(call);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a call
router.delete('/:id', async (req, res) => {
  try {
    await Call.findByIdAndDelete(req.params.id);
    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
