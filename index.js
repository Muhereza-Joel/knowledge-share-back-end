const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const tagRoutes = require('./routes/tags');

const app = express();
const port = process.env.PORT || 3001;

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(cors());

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tags', tagRoutes)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
