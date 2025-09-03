const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://racelearnuser:g56E2Ha4RnOqpED3@racelearndb.f4hg9bw.mongodb.net/?retryWrites=true&w=majority&appName=RaceLearnDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve React build (we’ll add this later)
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing (we’ll add this later)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RaceLearn running on port ${PORT}`));