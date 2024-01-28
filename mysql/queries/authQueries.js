const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const getAllUsers = (callback) => {
  pool.query("SELECT * FROM users", (error, results) => {
    callback(error, results);
  });
};

const loginUser = (identifier, password, callback) => {
  const isEmail = identifier.includes("@");
  const identifierField = isEmail ? "email" : "username";

  const query = `SELECT * FROM users WHERE ${identifierField} = ?`;
  pool.query(query, [identifier], (error, results) => {
    if (error) {
      return callback(error, null);
    }

    if (results.length === 0) {
      // User not found
      return callback(null, null);
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (compareError, isMatch) => {
      if (compareError) {
        return callback(compareError, null);
      }

      if (!isMatch) {
        // Passwords do not match
        return callback(null, null);
      }

      // Passwords match, return the user details
      callback(null, user);
    });
  });
};

const registerUser = (user, callback) => {
    const userId = uuidv4();
  
    // Check if the email or username is already in use
    pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [user.email, user.username],
      (queryError, existingUser) => {
        if (queryError) {
          return callback(queryError, null);
        }
  
        if (existingUser.length > 0) {
          // User with the same email or username already exists
          const isEmailTaken = existingUser.some((u) => u.email === user.email);
          const isUsernameTaken = existingUser.some((u) => u.username === user.username);
  
          const errors = {};
          if (isEmailTaken) {
            errors.email = "Email is already taken";
          }
          if (isUsernameTaken) {
            errors.username = "Username is already taken";
          }
  
          return callback(null, { errors });
        }
  
        // User does not exist, proceed with registration
        bcrypt.hash(user.password, 10, (hashError, hashedPassword) => {
          if (hashError) {
            return callback(hashError, null);
          }
  
          const query =
            "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
          const values = [userId, user.username, user.email, hashedPassword];
  
          pool.query(query, values, (error, results) => {
            if (error) {
              callback(error, null);
            } else {
              pool.query(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (error, selectResults) => {
                  callback(error, selectResults[0]);
                }
              );
            }
          });
        });
      }
    );
  };
  
  

module.exports = { registerUser, getAllUsers, loginUser };
