const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const getPopularTags = (searchQuery, callback) => {
  let query = "SELECT * FROM tags";
  const queryParams = [];

  if (searchQuery) {
    query += " WHERE name LIKE ?"; // Adjust the column name as needed
    queryParams.push(`%${searchQuery}%`);
  }

  pool.query(query, queryParams, (error, results) => {
    callback(error, results);
  });
};


const getMostUsedTags = (callback) => {
  pool.query("SELECT * FROM tags LIMIT 3", (error, results) => {
    callback(error, results);
  });
};

const addTag = (tag, callback) => {
  const tagId = uuidv4();

  const query = "INSERT INTO tags (id, name, description) VALUES (?, ?, ?)";
  const values = [tagId, tag.name, tag.description];

  pool.query(query, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      // Fetch the newly inserted tag from the database
      pool.query(
        "SELECT * FROM tags WHERE id = ?",
        [tagId],
        (error, selectResults) => {
          callback(error, selectResults[0]);
        }
      );
    }
  });
};

const updateTag = (tag, callback) => {
  const { id } = tag;

  const query = "UPDATE tags SET name = ?, description = ? WHERE id = ?";
  const values = [tag.title, tag.description, id];

  pool.query(query, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      // Fetch the newly inserted tag from the database
      pool.query(
        "SELECT * FROM tags WHERE id = ?",
        [id],
        (error, selectResults) => {
          callback(error, selectResults[0]);
        }
      );
    }
  });
};

module.exports = { getPopularTags, getMostUsedTags, addTag, updateTag };
