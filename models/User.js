const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, default: '' },
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
});

module.exports = mongoose.model('User', userSchema);