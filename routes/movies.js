const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Get all movies for a specific month
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const movies = await Movie.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add/Update movie for a date
router.post('/', async (req, res) => {
  try {
    const { date, movieTitle, jasperRating, gianneRating } = req.body;

    // Check if movie already exists for this date
    const existingMovie = await Movie.findOne({
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (existingMovie) {
      // Update existing movie
      existingMovie.movieTitle = movieTitle;
      existingMovie.jasperRating = jasperRating;
      existingMovie.gianneRating = gianneRating;
      const updatedMovie = await existingMovie.save();
      return res.json(updatedMovie);
    }

    // Create new movie
    const movie = new Movie({
      date: new Date(date).setHours(0, 0, 0, 0),
      movieTitle,
      jasperRating,
      gianneRating,
    });

    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete movie
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    await movie.deleteOne();
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
