const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const questionQueries = require("../mysql/queries/questionsQueries");

const fakeQuestions = [
  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to grow irish potatoes?",
    descrption:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et magna ac ligula finibus dignissim. Curabitur volutpat ut dui nec sollicitudin. Donec sed arcu vitae nunc vestibulum malesuada. Phasellus magna turpis, laoreet pellentesque lectus at, euismod malesuada sapien. Aliquam sapien quam, porta ac dui id, imperdiet lobortis ex. Phasellus gravida tristique molestie. Curabitur malesuada lorem quis libero molestie convallis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et magna ac ligula finibus dignissim. Curabitur volutpat ut dui nec sollicitudin. Donec sed arcu vitae nunc vestibulum malesuada. Phasellus magna turpis, laoreet pellentesque lectus at, euismod malesuada sapien. Aliquam sapien quam, porta ac dui id, imperdiet lobortis ex. Phasellus gravida tristique molestie. Curabitur malesuada lorem quis libero molestie convallisLorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et magna ac ligula finibus dignissim. Curabitur volutpat ut dui nec sollicitudin. Donec sed arcu vitae nunc vestibulum malesuada. Phasellus magna turpis, laoreet pellentesque lectus at, euismod malesuada sapien. Aliquam sapien quam, porta ac dui id, imperdiet lobortis ex. Phasellus gravida tristique molestie. Curabitur malesuada lorem quis libero molestie convallis",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "roket",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to grow tomatoes?",
    descrption:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et magna ac ligula finibus dignissim. Curabitur volutpat ut dui nec sollicitudin. Donec sed arcu vitae nunc vestibulum malesuada. Phasellus magna turpis, laoreet pellentesque lectus at, euismod malesuada sapien. Aliquam sapien quam, porta ac dui id, imperdiet lobortis ex. Phasellus Donec sed arcu vitae nunc vestibulum malesuada. Phasellus magna turpis, laoreet pellentesque lectus at, euismod malesuada sapien. Aliquam sapien quam, porta ac dui id, imperdiet lobortis ex. Phasellus gravida tristique molestie. Curabitur malesuada lorem quis libero molestie convallis",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "farming",
      },
      {
        id: uuidv4(),
        name: "roket",
      },
      {
        id: uuidv4(),
        name: "planting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to use metrazine when weeding maize?",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },

      {
        id: uuidv4(),
        name: "planting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to harvest tomatoes?",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "farming",
      },
      {
        id: uuidv4(),
        name: "harvesting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to harvest tomatoes?",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "farming",
      },
      {
        id: uuidv4(),
        name: "harvesting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to harvest tomatoes?",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "farming",
      },
      {
        id: uuidv4(),
        name: "harvesting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },

  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to harvest tomatoes?",
    tags: [
      {
        id: uuidv4(),
        name: "gardening",
      },
      {
        id: uuidv4(),
        name: "tomatoes",
      },
      {
        id: uuidv4(),
        name: "farming",
      },
      {
        id: uuidv4(),
        name: "harvesting",
      },
    ],

    votes: 10,
    answers: 3,
    views: 50,
  },
];

router.get("/all/:userId", (req, res) => {
  const { userId } = req.params;
  const userQuestions = fakeQuestions.filter(
    (question) => question.userId === userId
  );

  try {
    setTimeout(() => {
      res.json(userQuestions);
    }, 100); // delay
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


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
})

router.get("/all", (req, res) => {
  questionQueries.getAllQuestions((error, allQuestions) => {
    if (error) {
      console.error("Error getting all questions:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Add any additional processing or formatting if needed
    // For example, you might want to filter, sort, or paginate the questions

    res.json(allQuestions);
  });
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

router.post("/add", upload.array("images", 5), (req, res) => {
  try {
    // Process the uploaded images
    const imageUrls = req.files.map((file) => {
      const imageUrl = `${req.protocol}://${req.get("host")}/${file.path}`;
      return imageUrl;
    });

    const questionId = uuidv4();
    const title = req.body.questionTitle;
    const description = req.body.description;
    const userId = "0327359e-919f-46bb-ad9b-2830f21a643d";

    questionQueries.saveQuestion(
      questionId,
      title,
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
    const tags = req.body.tags || [];
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
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
