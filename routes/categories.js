const express = require("express");
const router = express.Router();
const categoriesQueries = require("../mysql/queries/categoryQueries");
const { v4: uuidv4 } = require("uuid");

router.post("/add", (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = { id, name };

    categoriesQueries.addCategory(category, (error, newCategory) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json(newCategory);
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/all", (req, res) => {
  try {
    categoriesQueries.getAllCategories((error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/delete", (req, res) => {
  try {
    const { id } = req.body;

    categoriesQueries.deleteCategory(id, (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } else {
        if (results && results.affectedRows > 0) {
          res.json({ id: id });
        } else {
          res.status(404).json({ error: "Category not found" });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:id", (req, res) => {
  try {
    const { id } = req.params;

    categoriesQueries.deleteCategory(id, (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } else {
        if (results && results.affectedRows > 0) {
          res.json({ id: id });
        } else {
          res.status(404).json({ error: "Category not found" });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
