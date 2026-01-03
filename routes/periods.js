const express = require('express');
const router = express.Router();
const Period = require('../models/Period');

// GET all periods (with optional date range)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const periods = await Period.find(query).sort({ startDate: -1 });
    res.json(periods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single period by ID
router.get('/:id', async (req, res) => {
  try {
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json(period);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new period
router.post('/', async (req, res) => {
  try {
    const { startDate, endDate, notes, symptoms, mood } = req.body;

    const period = new Period({
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || '',
      symptoms: symptoms || [],
      mood: mood || '',
    });

    // Calculate cycle length if there's a previous period
    if (endDate) {
      const previousPeriod = await Period.findOne({
        startDate: { $lt: new Date(startDate) },
      }).sort({ startDate: -1 });

      if (previousPeriod && previousPeriod.startDate) {
        const diffTime = new Date(startDate) - previousPeriod.startDate;
        period.cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    await period.save();
    res.status(201).json(period);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update period
router.put('/:id', async (req, res) => {
  try {
    const { startDate, endDate, notes, symptoms, mood } = req.body;

    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    if (startDate) period.startDate = new Date(startDate);
    if (endDate !== undefined)
      period.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) period.notes = notes;
    if (symptoms !== undefined) period.symptoms = symptoms;
    if (mood !== undefined) period.mood = mood;

    // Recalculate cycle length if period is completed
    if (period.endDate) {
      const previousPeriod = await Period.findOne({
        startDate: { $lt: period.startDate },
        _id: { $ne: period._id },
      }).sort({ startDate: -1 });

      if (previousPeriod && previousPeriod.startDate) {
        const diffTime = period.startDate - previousPeriod.startDate;
        period.cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    await period.save();
    res.json(period);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE period
router.delete('/:id', async (req, res) => {
  try {
    const period = await Period.findByIdAndDelete(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json({ message: 'Period deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET cycle statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const periods = await Period.find().sort({ startDate: -1 }).limit(6);

    if (periods.length === 0) {
      return res.json({
        averageCycleLength: null,
        averagePeriodDays: null,
        lastPeriodDate: null,
        cycleRegularity: 'insufficient-data',
      });
    }

    // Calculate average cycle length
    const cycleLengths = periods
      .filter((p) => p.cycleLength)
      .map((p) => p.cycleLength);

    const averageCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          )
        : null;

    // Calculate average period days
    const periodDays = periods
      .filter((p) => p.periodDays)
      .map((p) => p.periodDays);

    const averagePeriodDays =
      periodDays.length > 0
        ? Math.round(periodDays.reduce((a, b) => a + b, 0) / periodDays.length)
        : null;

    // Calculate cycle regularity (standard deviation)
    let cycleRegularity = 'insufficient-data';
    if (cycleLengths.length >= 3) {
      const stdDev = Math.sqrt(
        cycleLengths.reduce(
          (sq, n) => sq + Math.pow(n - averageCycleLength, 2),
          0
        ) / cycleLengths.length
      );

      if (stdDev <= 3) cycleRegularity = 'regular';
      else if (stdDev <= 7) cycleRegularity = 'somewhat-regular';
      else cycleRegularity = 'irregular';
    }

    res.json({
      averageCycleLength,
      averagePeriodDays,
      lastPeriodDate: periods[0].startDate,
      cycleRegularity,
      recentCycles: periods.map((p) => ({
        startDate: p.startDate,
        cycleLength: p.cycleLength,
        periodDays: p.periodDays,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
