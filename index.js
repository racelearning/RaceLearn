const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Course = require('./models/Course');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://racelearnuser:g56E2Ha4RnOqpED3@racelearndb.f4hg9bw.mongodb.net/?retryWrites=true&w=majority&appName=RaceLearnDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// API to save a course
app.post('/api/courses', async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = new Course({ title, description });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save course' });
  }
});

// API to get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RaceLearn running on port ${PORT}`));