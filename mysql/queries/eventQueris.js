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

    // Fetch the inserted data by querying the inserted ID
    const selectQuery = 'SELECT * FROM events WHERE id = ?';
    pool.query(selectQuery, [id], (selectError, selectResult) => {
      if (selectError) {
        return callback(selectError, null);
      }

      // Returning the data about the inserted row
      callback(null, selectResult[0]);
    });
  });
};


const editEvent = (eventId, title, startDate, endDate, callback) => {
  const query = `UPDATE events SET title = ?, start_date = ?, end_date = ? WHERE id = ?`;

  const values = [title, startDate, endDate, eventId];

  pool.query(query, values, (error, result) => {
    if(error) {
      return callback(error, null);
    }

    callback(null, null)
  })
};

const deleteEvent = (eventId, callback) => {
  const query = `DELETE FROM events WHERE id = ?`;
  
  pool.query(query, [eventId], (error, result) => {
    if(error) {
      return callback(error, null)
    }

    callback(null, null)
  })
}

const getAllEvents = (userId, callback) => {
  pool.query(
    "SELECT * FROM events WHERE user_id = ?",
    [userId],
    (error, results) => {
      callback(error, results);
    }
  );
};

module.exports = {
  saveEvent,
  getAllEvents,
  editEvent,
  deleteEvent
};
