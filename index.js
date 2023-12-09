const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/auth');

const app = express();
const port = 3001;

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(cors());

// Use the routes
app.use('/api/auth', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
