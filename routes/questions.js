const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const fakeQuestions = [
  {
    userId: "123",
    username: "Muhereza-Joel",
    questionId: uuidv4(),
    questionTitle: "How to grow irish potatoes?",
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
  
];

router.get("/all/:userId", (req, res) => {
  const { userId } = req.params;
  const userQuestions = fakeQuestions.filter(
    (question) => question.userId === userId
  );

  try {
    setTimeout(() => {
      res.json(userQuestions);
    }, 1000); // 1 second delay
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
