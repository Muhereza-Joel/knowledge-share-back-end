const express = require("express");
const router = express.Router();
const tagQueries = require("../mysql/queries/tagsQueries");

router.get("/popular-tags", (req, res) => {
  try {
    tagQueries.getPopularTags((error, results) => {
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

module.exports = router;
