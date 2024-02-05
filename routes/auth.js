const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { registerUser, getAllUsers, loginUser, saveProfilePhoto, getProfilePhoto } = require("../mysql/queries/authQueries");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/images"; // Specify your upload directory
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/change-avator", upload.single("avatar"), (req, res) => {
  try {
    const baseUrl = "http://localhost:3001/uploads/images/";
    const imageUrl = baseUrl + req.file.filename;

    const userId = req.body.userId;
    saveProfilePhoto(imageUrl,userId, (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-avator/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    getProfilePhoto(userId, (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

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
        id: user.id,
        role:user.role
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
