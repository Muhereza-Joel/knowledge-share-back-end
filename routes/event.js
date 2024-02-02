const express = require("express");
const router = express.Router();
const eventQueries = require("../mysql/queries/eventQueris")

router.post("/add", (req, res) => {
    try {
        const {title, start, end, userId} = req.body;
    
       
        eventQueries.saveEvent(title, start, end, userId, (error, result) => {
            if (error) {
              console.error("Error saving question information:", error);
              res.status(500).json({ message: "Error saving question information" });
            } else {
              res
                .status(200)
                .json({ message: "Event submitted successfully!" });
            }
          }
        );
      } catch (error) {
        console.error("Error processing the request:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }

})

router.post("/all", (req, res) => {
    try {
    const {userId} = req.body;
      eventQueries.getAllEvents(userId, (error, results) => {
        if (error) {
          throw error;
        }
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

module.exports = router;