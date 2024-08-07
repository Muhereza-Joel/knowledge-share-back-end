const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const questionQueries = require("../mysql/queries/questionsQueries");
const {
  broadcastNewQuestion,
  broadcastDeleteQuestion,
} = require("../websockets/websocket");

router.post("/question", async (req, res) => {
  const { questionId } = req.body;
  questionQueries.getQuestionDetails(questionId, (error, formattedQuestion) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!formattedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    setTimeout(() => {
      res.json(formattedQuestion);
    }, 100); // delay
  });
});

router.get("/all", (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 100;

  questionQueries.getAllQuestions(offset, limit, (error, allQuestions) => {
    if (error) {
      console.error("Error getting all questions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(allQuestions);
  });
});

router.get("/recent", (req, res) => {
  questionQueries.getRecentQuestions((error, allQuestions) => {
    if (error) {
      console.error("Error getting all questions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Add any additional processing or formatting if needed
    // For example, you might want to filter, sort, or paginate the questions

    res.json(allQuestions);
  });
});

router.get("/all/user/:userId", (req, res) => {
  const userId = req.params.userId;
  questionQueries.getUserQuestions(userId, (error, allQuestions) => {
    if (error) {
      console.error("Error getting all questions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Add any additional processing or formatting if needed
    // For example, you might want to filter, sort, or paginate the questions

    res.json(allQuestions);
  });
});

router.get("/tagged/:tagId", (req, res) => {
  const tagId = req.params.tagId; // Extract tagId from query parameters

  questionQueries.getAllQuestionsTagged((error, allQuestions) => {
    if (error) {
      console.error("Error getting all questions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(allQuestions);
  }, tagId);
});

router.put("/notifications/mark-seen/", (req, res) => {
  const notificationId = req.body.notificationId;
  const userId = req.body.userId;

  questionQueries.markNotificationAsSeen(
    notificationId,
    userId,
    (error, notificationId) => {
      if (error) {
        console.error("Error marking notification as seen:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(notificationId);
    }
  );
});

router.get("/notifications/:userId", (req, res) => {
  const userId = req.params.userId;

  questionQueries.getNotificationsWithUrls(
    userId,
    (error, allNotifications) => {
      if (error) {
        console.error("Error getting all notifications:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(allNotifications);
    }
  );
});

router.delete("/delete/:questionId", (req, res) => {
  const questionId = req.params.questionId;

  questionQueries.deleteQuestion(questionId, (error, result) => {
    if (error) {
      console.error("Error deleting question:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(result);
    broadcastDeleteQuestion(questionId);
  }); // Pass the tagId as the second parameter
});

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

router.post("/add-answer", upload.none(), (req, res) => {
  try {
    const answerId = uuidv4();
    const questionId = req.body.questionId;
    const answer = req.body.answer;
    const userId = req.body.userId;

    questionQueries.saveAnswer(
      answerId,
      questionId,
      answer,
      userId,
      (error, result) => {
        if (error) {
          console.error("Error saving question information:", error);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          res.status(200).json({ message: "Answer submitted successfully!" });
        }
      }
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/add", upload.array("images", 5), (req, res) => {
  try {
    const { questionTitle, description, userId, tags = [] } = req.body;

    // Validate required fields
    if (!questionTitle || !description || !userId || tags.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Process the uploaded images
    const imageUrls = req.files.map((file) => {
      const imageUrl = `${req.protocol}://${req.get("host")}/${file.path}`;
      return imageUrl;
    });

    const questionId = uuidv4();

    questionQueries.saveQuestion(
      questionId,
      questionTitle,
      description,
      userId,
      (error, savedQuestionId) => {
        if (error) {
          console.error("Error saving question information:", error);
        } else {
          console.log("Question information saved with ID:", savedQuestionId);
        }
      }
    );

    // Save question tags to the database
    questionQueries.saveQuestionTags(questionId, tags, (error, result) => {
      if (error) {
        console.error("Error saving question tags:", error);
      } else {
        console.log("Question tags saved");
      }
    });

    req.files.forEach((file) => {
      const url = `${req.protocol}://${req.get("host")}/${file.path}`;
      const destination = file.destination;

      questionQueries.saveImage(
        questionId,
        url,
        destination,
        file,
        (error, result) => {
          if (error) {
            console.error("Error saving image information:", error);
          } else {
            console.log("Image information saved");
          }
        }
      );
    });

    res
      .status(200)
      .json({ message: "Form submitted successfully!", imageUrls });

    setTimeout(() => {
      questionQueries.getQuestionById(questionId, (error, question) => {
        if (error) {
          console.error("Error fetching question:", error);
        } else {
          broadcastNewQuestion(question);
        }
      });
    }, 10000);
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
