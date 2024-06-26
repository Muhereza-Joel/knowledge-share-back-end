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

router.get('/question/:questionId', (req, res) => {
  const questionId = req.params.questionId;

  recommendationsQueries.getQuestionRecommendations(questionId, (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error retrieving recommendations' });
    }
    res.status(200).json(result);
  });
});

module.exports = router;
