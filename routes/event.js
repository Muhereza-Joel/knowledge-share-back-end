const express = require("express");
const router = express.Router();
const eventQueries = require("../mysql/queries/eventQueris")

router.post("/add", (req, res) => {
  try {
    const { title, start, end, userId } = req.body;

    eventQueries.saveEvent(title, start, end, userId, (error, eventData) => {
      if (error) {
        console.error("Error saving event information:", error);
        res.status(500).json({ message: "Error saving event information" });
      } else {
        res.status(200).json({
          message: "Event submitted successfully!",
          eventData: eventData, // Include the inserted event data in the response
        });
      }
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


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

  router.put("/update/:eventId", (req, res) => {
    try {
      const eventId = req.params.eventId;
      const {title, start, end} = req.body;

      eventQueries.editEvent(eventId, title, start, end, (error, results) => {
        if(error){
          throw error
        }

        res.json({message : "Event Updated Successfully"})
      })

    } catch (error) {
      res.status(500).json({error: "Internal Server Error" })
    }
  })

  router.delete("/delete/:eventId", (req, res) => {
    try {
      const eventId = req.params.eventId;

      eventQueries.deleteEvent(eventId, (error, results) => {
        if(error){
          throw error
        }

        res.json({message : "Event Deleted Successfully"})
      })
      
    } catch (error) {
      res.status(500).json({error: "Internal Server Error" })
    }
  })
  

module.exports = router;