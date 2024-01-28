const express = require("express");
const { registerUser, getAllUsers, loginUser } = require("../mysql/queries/authQueries");
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Call the loginUser function
  loginUser(email, password, (error, user) => {
    if (error) {
      // Handle login error
      console.error("Login error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    if (user) {
      // Login successful
      res.json({
        success: true,
        message: "Login successful",
        username: user.username,
      });
    } else {
      // Invalid credentials
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

router.get("/users", (req, res) => {
  try {
    getAllUsers((error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, Email and Password are required" });
  }

  // Transform the username to lowercase and replace spaces with hyphens
  const formattedUsername = username.toLowerCase().replace(/\s+/g, "-");

  registerUser(
    { username: formattedUsername, email, password },
    (error, user) => {
      if (error) {
        // Handle registration error
        console.error("Registration error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Registration successful, send the user details in the response
      res.json({ user });
    }
  );
});

module.exports = router;
