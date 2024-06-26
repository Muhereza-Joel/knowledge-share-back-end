const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const {
  addTransactionRecord,
  updateTransactionRecord,
  getCompleteteTransactions,
  getCustomerCompleteteTransactions,
  getTransactionRecord,
} = require("../mysql/queries/paymentQueries");

const handleResponse = (res, error, result) => {
  if (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    return;
  }
  res.json(result);
};

router.post("/add", (req, res) => {
  try {
    const {
      currency,
      amount,
      tracking_id,
      order_id,
    } = req.body;

    const transaction = {
      id: uuidv4(),
      currency: currency,
      amount: amount,
      reference_number: uuidv4(),
      tracking_id: tracking_id,
      order_id: order_id,
    };

    addTransactionRecord(transaction, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update", (req, res) => {
  try {
    const {
      status,
      tracking_id,
      payment_method,
      order_id,
    } = req.body;

    const transaction = {
      status: status,
      tracking_id: tracking_id,
      payment_method: payment_method,
      order_id: order_id,
    };

    updateTransactionRecord(transaction, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", (req, res) => {
  try {
    getCompleteteTransactions((error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/payment/:id", (req, res) => {
  try {
    const transactionId = req.query.customerId;
    getTransactionRecord(transactionId, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all/customer/:id", (req, res) => {
  try {
    const customerId = req.query.customerId;
    getCustomerCompleteteTransactions(customerId, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:id", (req, res) => {
  try {
    const transactionId = req.query.transactionId;
    deleteTransactionRecord(transactionId, (error, result) => {
      if (error) {
        res.status(500).json({ errors: error });
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
