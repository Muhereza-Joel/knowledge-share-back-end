const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const addComment = (comment, questionId, answerId, userId, callback) => {
  const id = uuidv4();

  const query = `INSERT into comments(id, comment, question_id, answer_id, user_id) VALUES (?, ?, ?, ?, ?)`;
  const values = [id, comment, questionId, answerId, userId];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    const selectQuery = `SELECT c.id, c.comment, c.question_id, c.answer_id, c.user_id, c.created_at, c.updated_at, u.username 
       FROM comments c  
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`;

    pool.query(selectQuery, [id], (selectError, selectResult) => {
      if (selectError) {
        return callback(selectError, null);
      }

      // Returning the data about the inserted row
      callback(null, selectResult[0]);
    });
  });
};

const getAllComments = (answerId, callback) => {
  const query = `SELECT c.id, c.comment, c.question_id, c.answer_id, c.user_id, c.created_at, c.updated_at, u.username 
  FROM comments c  
  JOIN users u ON c.user_id = u.id
  WHERE c.answer_id = ?`;

  pool.query(query, [answerId], (error, results) => {
    callback(error, results);
  });
};

const getAllReplies = (commentId, callback) => {
  const query = `SELECT r.id, r.comment_id, r.reply, r.user_id, r.created_at, r.updated_at, u.username 
       FROM replies r  
       JOIN users u ON r.user_id = u.id
       WHERE r.comment_id = ?`;

  pool.query(query, [commentId], (error, results) => {
    callback(error, results);
  });
};

const editComment = (commentId, comment, callback) => {
  const query = `UPDATE comments SET comment = ? WHERE id = ?`;

  const values = [comment, commentId];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    const selectQuery = `SELECT c.id, c.comment, c.question_id, c.answer_id, c.user_id, c.created_at, c.updated_at, u.username 
    FROM comments c  
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`;

    pool.query(selectQuery, [commentId], (selectError, selectResult) => {
      if (selectError) {
        return callback(selectError, null);
      }

      callback(null, selectResult[0]);
    });
  });
};

const deleteComment = (commentId, callback) => {
  const query = `DELETE FROM comments WHERE id = ?`;

  pool.query(query, [commentId], (error, result) => {
    if (error) {
      return callback(error, null);
    } else {
      callback(null, commentId);
    }
  });
};

const addReply = (commentId, reply, userId, callback) => {
  const id = uuidv4();

  const query = `INSERT into replies(id, comment_id, user_id, reply) VALUES (?, ?, ?, ?)`;
  const values = [id, commentId, userId, reply];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    const selectQuery = `SELECT r.id, r.comment_id, r.reply, r.user_id, r.created_at, r.updated_at, u.username 
       FROM replies r  
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`;

    pool.query(selectQuery, [id], (selectError, selectResult) => {
      if (selectError) {
        return callback(selectError, null);
      }

      // Returning the data about the inserted row
      callback(null, selectResult[0]);
    });
  });
};

module.exports = {
  addComment,
  getAllComments,
  editComment,
  deleteComment,
  addReply,
  getAllReplies
};
