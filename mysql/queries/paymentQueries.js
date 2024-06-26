const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const addTransactionRecord = (transaction, callback) => {
  const values = [
    transaction.id,
    transaction.currency,
    transaction.amount,
    transaction.reference_number,
    transaction.tracking_id,
    transaction.order_id,
  ];

  const checkQuery = "SELECT * FROM transactions WHERE tracking_id = ?";
  pool.query(checkQuery, [transaction.tracking_id], (checkError, checkResults) => {
    if (checkError) {
      callback(checkError, null);
    } else {
      if (checkResults && checkResults.length > 0) {
        // If the tracking_id already exists, return the existing row
        callback(null, checkResults[0]);
      } else {
        // If the tracking_id doesn't exist, insert a new row
        const insertQuery = `INSERT INTO transactions(id, currency, amount, reference_number, tracking_id, order_id)
                             VALUES(?, ?, ?, ?, ?, ?)`;
        pool.query(insertQuery, values, (insertError, insertResult) => {
          if (insertError) {
            callback(insertError, null);
          } else {
            // Retrieve the inserted row by ID
            pool.query(
              "SELECT * FROM transactions WHERE id = ?",
              [transaction.id],
              (selectError, selectResults) => {
                callback(selectError, selectResults[0]);
              }
            );
          }
        });
      }
    }
  });
};


const updateTransactionRecord = (transaction, callback) => {
  const { status, payment_method, order_id } = transaction;

  pool.getConnection((err, connection) => {
    if (err) {
      callback(err, null);
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        callback(err, null);
        return;
      }

      const updateTransactionQuery = `UPDATE transactions SET status = ?, payment_method = ? WHERE order_id = ?`;
      const updateTransactionValues = [status, payment_method, order_id];

      connection.query(updateTransactionQuery, updateTransactionValues, (error, result) => {
        if (error) {
          return connection.rollback(() => {
            connection.release();
            callback(error, null);
          });
        }

        const updateOrderQuery = `UPDATE orders SET status = 'paid' WHERE id = ?`;
        const updateOrderValues = [order_id];

        connection.query(updateOrderQuery, updateOrderValues, (error, result) => {
          if (error) {
            return connection.rollback(() => {
              connection.release();
              callback(error, null);
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            connection.release();
            callback(null, { message: 'Transaction and order updated successfully' });
          });
        });
      });
    });
  });
};


const deleteTransactionRecord = (transactionId, callback) => {};

const getTransactionRecord = (transactionId, callback) => {};

const getCompleteteTransactions = (callback) => {};

const getCustomerCompleteteTransactions = (customerId, callback) => {};

module.exports = {
  addTransactionRecord,
  updateTransactionRecord,
  deleteTransactionRecord,
  getTransactionRecord,
  getCompleteteTransactions,
  getCustomerCompleteteTransactions,
};
