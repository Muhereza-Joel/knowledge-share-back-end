const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const recommendationsQueries = require("../mysql/queries/recommendationsQueries");

router.post("/add", (req, res) => {
  const recommendationData = req.body;

  recommendationsQueries.saveRecommendation(recommendationData, (error) => {
    if (error) {
      console.error("Error submitting recommendations:", error);
      return res
        .status(500)
        .json({ error: "Failed to submit recommendations" });
    }
    res.status(200).json({ message: "Recommendations submitted successfully" });
  });
});

module.exports = router;
