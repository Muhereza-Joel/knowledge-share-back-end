const express = require("express");
const router = express.Router();
const tagQueries = require("../mysql/queries/tagsQueries");

router.get("/popular-tags", (req, res) => {
  try {
    const searchQuery = req.query.query || ''; // Default to an empty string if query is not provided
    tagQueries.getPopularTags(searchQuery, (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", (req, res) => {
  try {
    const searchQuery = req.query.query || ''; // Default to an empty string if query is not provided
    tagQueries.getAllTags(searchQuery, (error, results) => {
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
    tagQueries.getMostUsedTags((error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add-tag", (req, res) => {
  try {
    const {name, description} = req.body;

    if(!name || !description){
      return res.status(400).json({error: "Name and Description are required"});
    }

    const tag = {name, description};

    tagQueries.addTag(tag, (error, newTag) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json(newTag);
    });
  } catch (error) {
    res.status(500).json({error: "Internal Server Error"});
  }
});

router.post("/edit-tag", (req, res) => {
  try {
    const {id, title, description} = req.body;

    if(!title || !description){
      return res.status(400).json({error: "Name and Description are required"});
    }

    const tag = {id, title, description};

    tagQueries.updateTag(tag, (error, newTag) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json(newTag);
    });
  } catch (error) {
    res.status(500).json({error: "Internal Server Error"});
  }
});

router.post("/delete-tag", (req, res) => {
  try {
    const { id } = req.body;

    tagQueries.deleteTag(id, (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } else {
        // Check if any rows were affected by the delete operation
        if (results && results.affectedRows > 0) {
          res.json({ id: id });
        } else {
          res.status(404).json({ error: "Tag not found" });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
