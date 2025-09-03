const express = require('express');
const mongoose = require('mongoose'); // Add this for future MongoDB use
const path = require('path');
const app = express();

// Serve React build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RaceLearn running on port ${PORT}`));