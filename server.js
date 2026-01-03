const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://coupal-site-frontend.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running! 🚀' });
});

app.use('/api/items', require('./routes/items'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/periods', require('./routes/periods'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
