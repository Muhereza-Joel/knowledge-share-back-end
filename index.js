const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const tagRoutes = require('./routes/tags');
const eventRoutes = require('./routes/event');
const commentRoutes = require('./routes/comments');

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(cors());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://knowledgeshare.tagbatwaha.com/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Access-Control-Allow-Origin');
  res.setHeader('Access-Control-Allow-Credentials', true);
next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/comments', commentRoutes);

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
