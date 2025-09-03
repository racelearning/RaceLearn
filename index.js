const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Welcome to RaceLearn!'));
app.listen(process.env.PORT || 3000, () => console.log('RaceLearn running'));