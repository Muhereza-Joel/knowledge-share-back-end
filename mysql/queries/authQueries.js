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
        const isUsernameTaken = existingUser.some(
          (u) => u.username === user.username
        );

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

const saveProfilePhoto = (url, userId, callback) => {
  const id = uuidv4();
  const deleteQuery = `DELETE FROM profile_images WHERE user_id = ?`;

  pool.getConnection((error, connection) => {
    if (error) {
      return callback(error, null);
    }

    connection.beginTransaction((beginError) => {
      if (beginError) {
        connection.release();
        return callback(beginError, null);
      }

      // Delete existing photo
      connection.query(deleteQuery, [userId], (deleteError) => {
        if (deleteError) {
          return connection.rollback(() => {
            connection.release();
            callback(deleteError, null);
          });
        }

        // Insert new photo
        const insertQuery = `INSERT INTO profile_images(id, user_id, url) VALUES (?, ?, ?)`;
        const insertValues = [id, userId, url];

        connection.query(
          insertQuery,
          insertValues,
          (insertError, insertResult) => {
            if (insertError) {
              return connection.rollback(() => {
                connection.release();
                callback(insertError, null);
              });
            }

            // Commit the transaction
            connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  connection.release();
                  callback(commitError, null);
                });
              }

              // Release the connection after a successful transaction
              connection.release();

              // Returning the data about the inserted row
              callback(null, { url });
            });
          }
        );
      });
    });
  });
};

const getProfilePhoto = (userId, callback) => {
  const query = `SELECT url FROM profile_images WHERE user_id = ?`;

  pool.query(query, [userId], (error, results) => {
    callback(error, results);
  });
};


const addProfile = (userData, profileData, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err, null);
      return;
    }

    connection.beginTransaction((beginErr) => {
      if (beginErr) {
        connection.release();
        callback(beginErr, null);
        return;
      }

      // Check if the new username is already taken
      connection.query(
        'SELECT id FROM users WHERE username = ? AND id <> ?',
        [userData.username, userData.userId],
        (checkUsernameErr, existingUser) => {
          if (checkUsernameErr) {
            return connection.rollback(() => {
              connection.release();
              callback(checkUsernameErr, null);
            });
          }

          if (existingUser.length > 0) {
            return connection.rollback(() => {
              connection.release();
              return callback('Username is already taken', null);
            });
          }

          // Check if the new email is already taken
          connection.query(
            'SELECT id FROM users WHERE email = ? AND id <> ?',
            [userData.email, userData.userId],
            (checkEmailErr, existingEmail) => {
              if (checkEmailErr) {
                return connection.rollback(() => {
                  connection.release();
                  callback(checkEmailErr, null);
                });
              }

              if (existingEmail.length > 0) {
                return connection.rollback(() => {
                  connection.release();
                  callback('Email is already taken', null);
                });
              }

              // Proceed with the update or insert
              connection.query(
                'UPDATE users SET email = ?, username = ? WHERE id = ?',
                [userData.email, userData.username, userData.userId],
                (updateUsersErr) => {
                  if (updateUsersErr) {
                    return connection.rollback(() => {
                      connection.release();
                      callback(updateUsersErr, null);
                    });
                  }

                  connection.query(
                    'SELECT * FROM profiles WHERE user_id = ?',
                    [userData.userId],
                    (selectProfileErr, existingProfile) => {
                      if (selectProfileErr) {
                        return connection.rollback(() => {
                          connection.release();
                          callback(selectProfileErr, null);
                        });
                      }

                      if (existingProfile.length > 0) {
                        connection.query(
                          'UPDATE profiles SET fullname = ?, dob = ?, gender = ?, country = ?, city = ?, phone_number = ?, username = ? WHERE user_id = ?',
                          [
                            profileData.fullname,
                            profileData.dob,
                            profileData.gender,
                            profileData.country,
                            profileData.city,
                            profileData.phone_number,
                            userData.username,
                            userData.userId,
                          ],
                          (updateProfileErr) => {
                            if (updateProfileErr) {
                              return connection.rollback(() => {
                                connection.release();
                                callback(updateProfileErr, null);
                              });
                            }

                            connection.commit((commitErr) => {
                              if (commitErr) {
                                return connection.rollback(() => {
                                  connection.release();
                                  callback(commitErr, null);
                                });
                              }

                              connection.release();
                              callback(null, 'Tables updated successfully');
                            });
                          }
                        );
                      } else {
                        connection.query(
                          'INSERT INTO profiles (id, username, fullname, dob, gender, country, city, phone_number, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                          [
                            uuidv4(),
                            userData.username,
                            profileData.fullname,
                            profileData.dob,
                            profileData.gender,
                            profileData.country,
                            profileData.city,
                            profileData.phone_number,
                            userData.userId,
                          ],
                          (insertProfileErr) => {
                            if (insertProfileErr) {
                              return connection.rollback(() => {
                                connection.release();
                                callback(insertProfileErr, null);
                              });
                            }

                            connection.commit((commitErr) => {
                              if (commitErr) {
                                return connection.rollback(() => {
                                  connection.release();
                                  callback(commitErr, null);
                                });
                              }

                              connection.release();
                              callback(null, 'Tables updated successfully');
                            });
                          }
                        );
                      }
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};



module.exports = {
  registerUser,
  getAllUsers,
  loginUser,
  saveProfilePhoto,
  getProfilePhoto,
  addProfile
};
