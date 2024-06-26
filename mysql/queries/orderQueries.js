const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const getCustomerOrders = (userId, callback) => {
  const query = `SELECT o.id, o.user_id, p.fullname, p.phone_number, products.product_name, o.quantity, o.amount, o.status FROM orders o 
                LEFT JOIN profiles p ON p.user_id = o.user_id
                LEFT JOIN products ON products.id = o.product_id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC`;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

const getOrders = (callback) => {
  const query = `SELECT o.id, o.user_id, p.fullname, p.phone_number, products.product_name, o.quantity, o.amount, o.status FROM orders o 
                LEFT JOIN profiles p ON p.user_id = o.user_id
                LEFT JOIN products ON products.id = o.product_id
                ORDER BY o.created_at DESC`;

  pool.query(query, [], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

const addOrderRecord = (order, callback) => {
  const values = [
    order.orderId,
    order.userId,
    order.productId,
    order.quantity,
    order.amount,
  ];

  const query = `INSERT INTO orders(id, user_id, product_id, quantity, amount)
                  VALUES(?, ?, ?, ?, ?)`;

  pool.query(query, values, (error, result) => {
    if (error) {
      callback(error, null);
    } else {
      pool.query(
        "SELECT * FROM orders WHERE id = ?",
        [order.orderId],
        (error, selectResults) => {
          callback(error, selectResults[0]);
        }
      );
    }
  });
};

const deleteOrderRecord = (recordId, callback) => {
  pool.query("DELETE FROM orders WHERE id = ?", [recordId], (error, result) => {
    callback(error, recordId);
  });
};

const updateOrderRecord = (recordId, data, callback) => {};

module.exports = {
  deleteOrderRecord,
  updateOrderRecord,
  getOrders,
  addOrderRecord,
  getCustomerOrders,
};
