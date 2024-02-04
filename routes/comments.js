const express = require("express");
const router = express.Router();
const commentQueries = require("../mysql/queries/commentsQueries");

router.post("/add", (req, res) => {
  try {
    const { comment, questionId, answerId, userId } = req.body;
    commentQueries.addComment(comment, questionId, answerId, userId, (error, result) => {
      if (error) {
        console.error("Error saving comment information:", error);
        res.status(500).json({ message: "Error saving comment information" });
      } else {
        res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/add-reply", (req, res) => {
    try {
        const { commentId, reply, userId } = req.body;
        commentQueries.addReply(commentId, reply, userId, (error, result) => {
          if (error) {
            console.error("Error saving reply information:", error);
            res.status(500).json({ message: "Error saving reply information" });
          } else {
            res.status(200).json(result);
          }
        });
      } catch (error) {
        console.error("Error processing the request:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
})

router.get("/all/:answerId", (req, res) => {
  try {
    const { answerId } = req.params;
    commentQueries.getAllComments(answerId, (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/replies/:commentId", (req, res) => {
    try {
        const { commentId } = req.params;
        commentQueries.getAllReplies(commentId, (error, results) => {
          if (error) {
            throw error;
          }
          res.json(results);
        });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
})

router.put("/update/:commentId", (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { comment } = req.body;

    commentQueries.editComment(commentId, comment, (error, results) => {
      if (error) {
        throw error;
      }

      res.json({ 
        message: "Comment Updated Successfully",
        data : results
    });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:commentId", (req, res) => {
  try {
    const commentId = req.params.commentId;

    commentQueries.deleteComment(commentId, (error, results) => {
      if (error) {
        throw error;
      }

      res.json({
        message: "Comment Deleted Successfully",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
