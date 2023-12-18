const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

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

router.get("/question/:questionId", (req, res) => {
  const { questionId } = req.params;
  console.log(questionId);
  const question = fakeQuestions.filter(
    (question) => question.questionId === questionId
  );

  try {
    setTimeout(() => {
      res.json(question);
    }, 100); // delay
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", (req, res) => {
  try {
    setTimeout(() => {
      res.json(fakeQuestions);
    }, 100); // delay
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
