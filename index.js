const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGODB_URI;
const path = require('path');
const Course = require('./models/Course');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err.message));

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body; // Include email
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email }); // Include email
    await user.save();
    console.log('User registered:', username);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = new Course({ title, description });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save course' });
  }
});

app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete course' });
  }
});

// Create a new quiz
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  const { courseId, title, questions } = req.body;
  try {
    const quiz = new Quiz({ courseId, title, questions });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create quiz' });
  }
});

// Get quizzes for a course
app.get('/api/quizzes/:courseId', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('createdCourses createdQuizzes');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { email, fullName } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { email, fullName }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RaceLearn running on port ${PORT}`));