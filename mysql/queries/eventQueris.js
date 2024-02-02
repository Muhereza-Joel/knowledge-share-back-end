const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const saveEvent = (title, startDate, endDate, userId, callback) => {
  const id = uuidv4();

  const query = `INSERT INTO events (id, title, start_date, end_date, user_id) 
  VALUES (?, ?, ?, ?, ?);
  `;

  const values = [id, title, startDate, endDate, userId];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    callback(null, null);
  });
};

const getAllEvents = (userId, callback) => {
    pool.query("SELECT * FROM events WHERE user_id = ?", [userId], (error, results) => {
      callback(error, results);
    });
  };

module.exports = {
  saveEvent,
  getAllEvents
};
