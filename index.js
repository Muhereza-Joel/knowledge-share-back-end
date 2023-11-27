const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(cors());

// Fake user data for authentication
const fakeUserData = [
  { email: 'test@example.com', password: 'password123' },
  // Add more fake user data as needed
];

// Authentication endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the provided credentials match any user
  const user = fakeUserData.find((user) => user.email === email && user.password === password);

  if (user) {
    // Simulate a successful login
    res.json({ success: true, message: 'Login successful' });
  } else {
    // Simulate a failed login
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
