const express = require('express');
const router = express.Router();

// Fake user data for authentication
const fakeUserData = [
    {username: 'username', email: 'test@example.com', password: 'password123' },
  ];

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if the provided credentials match any user
  const user = fakeUserData.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    res.json({ success: true, message: "Login successful", username: user.username });

  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

router.post("/register", (req, res) => {
  const {username, email, password } = req.body;
  const userExists = fakeUserData.find((user) => user.email === email);

  if (userExists) {
    res
      .status(400)
      .json({ success: false, message: "Email is already registered" });
  } else {

    fakeUserData.push({ username, email, password });

    res.json({ success: true, message: "Registration successful" });
  }
});

module.exports = router;
