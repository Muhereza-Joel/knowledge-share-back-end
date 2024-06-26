const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const {
  addOrderRecord,
  getOrders,
  deleteOrderRecord,
  getCustomerOrders
} = require("../mysql/queries/orderQueries");


router.post("/add", (req, res) => {
  try {
    const { productId, userId, amountDue, quantity } = req.body;
  
    const order = {
      orderId : uuidv4(),
      productId : productId,
      userId : userId,
      amount: amountDue,
      quantity: quantity,
    };

    addOrderRecord(order, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    })
    
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get("/my-orders", (req, res) => {
  try {
    const userId = req.query.id;
    getCustomerOrders(userId,(error, results) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(results);
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})
router.get("/all", (req, res) => {
  try {
    getOrders((error, results) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(results);
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.delete("/delete/:id", (req, res) => {
  try {
    recordId = req.params.id;

    deleteOrderRecord(recordId, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

module.exports = router;
