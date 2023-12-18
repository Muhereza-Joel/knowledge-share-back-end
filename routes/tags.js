const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const mysql = require("mysql");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "knowledge_share_db",
});

const popularTags = [
  {
    id: uuidv4(),
    name: "gardening",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "tomatoes",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "herbicides",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "harvesting",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "mulching",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "prunning",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "weeding",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "planting",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "marketing",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "roket",
    description: "This tag has all questions tagged gardening",
  },
];

const mostUsedTags = [
  {
    id: uuidv4(),
    name: "gardening",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "tomatoes",
    description: "This tag has all questions tagged gardening",
  },
  {
    id: uuidv4(),
    name: "herbicides",
    description: "This tag has all questions tagged gardening",
  },
];

router.get("/popular-tags", (req, res) => {
  try {
    pool.query("SELECT * FROM tags", (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/most-used-tags", (req, res) => {
    try {
        setTimeout(() => {
          res.json(mostUsedTags);
        }, 100); // delay
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
});

module.exports = router;
