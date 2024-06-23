const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const saveQuestion = (questionId, title, description, userId, callback) => {
  const query = `
    INSERT INTO questions (id, title, description, user_id)
    VALUES (?, ?, ?, ?);
  `;

  const values = [questionId, title, description, userId];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    // Call getAllUserIdsExceptCurrent to get user ids
    getAllUserIdsExceptCurrent(userId, (userIdsError, userIds) => {
      if (userIdsError) {
        console.error("Error getting user ids:", userIdsError);
        // Handle the error
        callback(userIdsError, null);
      } else {
        // Call saveNotifications with retrieved user ids
        saveNotifications(questionId, userIds);
        callback(null, null);
      }
    });
  });
};

const getAllUserIdsExceptCurrent = (currentUserId, callback) => {
  const allUserIdsQuery = `
    SELECT id
    FROM users
    WHERE id <> ?
  `;

  pool.query(
    allUserIdsQuery,
    [currentUserId],
    (userIdsError, userIdsResult) => {
      if (userIdsError) {
        console.error("Error executing user ids query:", userIdsError);
        return callback(userIdsError, null);
      }

      const userIds = userIdsResult.map((user) => user.id);
      callback(null, userIds);
    }
  );
};

const saveNotifications = (questionId, userIds) => {
  const notificationMessage = "A new question has been added,";

  userIds.forEach((userId) => {
    // Assuming you have a function to generate notification_id
    const notificationId = uuidv4();

    const query = `
      INSERT INTO question_notifications (notification_id, user_id, question_id, notification_message, is_seen)
      VALUES (?, ?, ?, ?, FALSE)
    `;

    // Execute the query using your database connection
    pool.query(
      query,
      [notificationId, userId, questionId, notificationMessage],
      (error, result) => {
        if (error) {
          console.error("Error saving notification:", error);
        } else {
          console.log("Notification saved for user:", userId);
        }
      }
    );
  });
};

const saveAnswer = (id, questionId, answer, userId, callback) => {
  const query = `INSERT INTO question_answers (id, question_id, answer, user_id) 
  VALUES (?, ?, ?, ?);
  `;

  const values = [id, questionId, answer, userId];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    callback(null, null);
  });
};

const saveImage = (questionId, url, destination, file, callback) => {
  const { mimetype, filename, size } = file;

  const query = `
      INSERT INTO question_images (question_id, url, mimetype, destination, filename, size) 
      VALUES (?, ?, ?, ?, ?, ?);
    `;

  const values = [questionId, url, mimetype, destination, filename, size];

  pool.query(query, values, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, null);
  });
};

const saveQuestionTags = (questionId, tags, callback) => {
  const tagsArray = JSON.parse(tags);

  console.log("Received tags:", tagsArray);

  const query = `
      INSERT IGNORE INTO question_tag_mapping (question_id, tag_id)
      VALUES ?;
    `;

  const values = tagsArray.map((tagId) => [questionId, tagId]);

  console.log("Query:", query);
  console.log("Values", values);

  pool.query(query, [values], (error, result) => {
    if (error) {
      console.error("Error executing query:", error);
      return callback(error, null);
    }

    console.log("Query result:", result);
    callback(null, "Question tags saved successfully");
  });
};

const getAllQuestions = (offset, limit, callback) => {
  const allQuestionsQuery = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.user_id,
      q.created_at,
      q.updated_at,
      u.username,
      pi.url as avatar_url,
      (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) as answer_count,
      CASE WHEN r.question_id IS NOT NULL THEN 1 ELSE 0 END as has_recommendations
    FROM
      questions q
    JOIN
      users u ON q.user_id = u.id
    LEFT JOIN
      profile_images pi ON q.user_id = pi.user_id
    LEFT JOIN
      recommendations r ON q.id = r.question_id
    LIMIT ? OFFSET ?
  `;

  pool.query(allQuestionsQuery, [limit, offset], (error, questionsResult) => {
    if (error) {
      console.error("Error executing questions query:", error);
      return callback(error, null);
    }

    const allQuestions = [];

    if (questionsResult.length === 0) {
      return callback(null, allQuestions); // Return empty array if no questions found
    }

    for (const question of questionsResult) {
      const tagsQuery = `
        SELECT
          t.id, t.name
        FROM
          tags t
        JOIN
          question_tag_mapping qtm ON t.id = qtm.tag_id
        WHERE
          qtm.question_id = ?
      `;

      pool.query(tagsQuery, [question.id], (tagsError, tagsResult) => {
        if (tagsError) {
          console.error("Error executing tags query:", tagsError);
          return callback(tagsError, null);
        }

        const tags = Array.isArray(tagsResult)
          ? tagsResult.map((tag) => ({ id: tag.id, name: tag.name }))
          : [];

        const imagesQuery = `
          SELECT
            url, size
          FROM
            question_images
          WHERE
            question_id = ?
        `;

        pool.query(imagesQuery, [question.id], (imagesError, imagesResult) => {
          if (imagesError) {
            console.error("Error executing images query:", imagesError);
            return callback(imagesError, null);
          }

          const urls = Array.isArray(imagesResult)
            ? imagesResult.map((image) => ({
                url: image.url,
                size: image.size,
              }))
            : [];

          const formattedQuestion = {
            questionId: question.id,
            questionTitle: question.title,
            description: question.description,
            userId: question.user_id,
            username: question.username,
            avatarUrl: question.avatar_url,
            created_at: question.created_at,
            updated_at: question.updated_at,
            tags: tags,
            images: urls,
            votes: 0,
            answers: question.answer_count,
            views: 0,
            hasRecommendations: question.has_recommendations === 1, // Convert 1/0 to boolean
          };

          allQuestions.push(formattedQuestion);

          if (allQuestions.length === questionsResult.length) {
            return callback(null, allQuestions);
          }
        });
      });
    }
  });
};

const getQuestionDetails = async (questionId, callback) => {
  const questionQuery = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.user_id as question_user_id,
      q.created_at,
      q.updated_at,
      u.username,
      u.role,
      pi.url as avatarUrl,  -- Include avatar URL
      r.product_ids as recommendations  -- Include recommendations as JSON string
    FROM
      questions q
    JOIN
      users u ON q.user_id = u.id
    LEFT JOIN
      profile_images pi ON q.user_id = pi.user_id  -- Join profile_images table
    LEFT JOIN
      recommendations r ON q.id = r.question_id  -- Join recommendations table
    WHERE
      q.id = ?
  `;

  pool.query(questionQuery, [questionId], async (error, questionResult) => {
    if (error) {
      console.error("Error executing question query:", error);
      return callback(error, null);
    }

    if (questionResult.length === 0) {
      // Question not found
      return callback(null, null);
    }

    const question = questionResult[0];

    const tagsQuery = `
      SELECT
        t.id, t.name
      FROM
        tags t
      JOIN
        question_tag_mapping qtm ON t.id = qtm.tag_id
      WHERE
        qtm.question_id = ?
    `;

    pool.query(tagsQuery, [questionId], (tagsError, tagsResult) => {
      if (tagsError) {
        console.error("Error executing tags query:", tagsError);
        return callback(tagsError, null);
      }

      const tags = tagsResult.map((tag) => ({ id: tag.id, name: tag.name }));

      const imagesQuery = `
        SELECT
          url, size
        FROM
          question_images
        WHERE
          question_id = ?
      `;

      pool.query(imagesQuery, [questionId], (imagesError, imagesResult) => {
        if (imagesError) {
          console.error("Error executing images query:", imagesError);
          return callback(imagesError, null);
        }

        const urls = imagesResult.map((image) => ({
          url: image.url,
          size: image.size,
        }));

        const answersQuery = `
          SELECT
            qa.id,
            question_id,
            answer,
            qa.user_id as answer_user_id,
            users.username,
            pi.url as avatarUrl, -- Include avatar URL for answers
            users.role,
            qa.created_at,
            qa.updated_at
          FROM
            question_answers qa
            INNER JOIN users ON qa.user_id = users.id
            LEFT JOIN profile_images pi ON qa.user_id = pi.user_id -- Join profile_images table for answers
          WHERE
            question_id = ?
        `;

        pool.query(
          answersQuery,
          [questionId],
          (answersError, answersResult) => {
            if (answersError) {
              console.error("Error executing answers query:", answersError);
              return callback(answersError, null);
            }

            const answers = answersResult.map((answer) => ({
              answerId: answer.id,
              questionId: answer.question_id,
              answerContent: answer.answer,
              userId: answer.answer_user_id, // Use the alias for clarity
              username: answer.username,
              role: answer.role,
              avatarUrl: answer.avatarUrl, // Include avatar URL for answers
              created_at: answer.created_at,
              updated_at: answer.updated_at,
            }));

            const hasRecommendations = !!question.recommendations;
            const recommendations = hasRecommendations
              ? JSON.parse(question.recommendations)
              : [];

            const formattedQuestion = {
              questionId: question.id,
              questionTitle: question.title,
              description: question.description,
              userId: question.question_user_id, // Use the alias for clarity
              username: question.username,
              avatarUrl: question.avatarUrl, // Include avatar URL
              created_at: question.created_at,
              updated_at: question.updated_at,
              tags: tags,
              images: urls,
              votes: 0, // Add logic to calculate votes, answers, and views if needed
              answers: answers,
              views: 0,
              hasRecommendations: hasRecommendations,
              recommendations: recommendations,
            };

            return callback(null, formattedQuestion);
          }
        );
      });
    });
  });
};


const getAllQuestionsTagged = (callback, tagId = null) => {
  // Define the base query
  let allQuestionsQuery = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.user_id,
      q.created_at,
      q.updated_at,
      u.username,
      pi.url as avatar_url,  -- Include avatar URL
      (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) as answer_count,
      CASE WHEN r.question_id IS NOT NULL THEN 1 ELSE 0 END as has_recommendations
    FROM
      questions q
    JOIN
      users u ON q.user_id = u.id
    LEFT JOIN
      profile_images pi ON q.user_id = pi.user_id  -- Join profile_images table
    LEFT JOIN
      recommendations r ON q.id = r.question_id  -- Join recommendations table
  `;

  // If tagId is provided, join with the tags table and add a WHERE clause
  if (tagId) {
    allQuestionsQuery += `
      JOIN question_tag_mapping qtm ON q.id = qtm.question_id
      WHERE qtm.tag_id = ?
    `;
  }

  // Execute the query
  pool.query(
    allQuestionsQuery,
    tagId ? [tagId] : [],
    (error, questionsResult) => {
      if (error) {
        console.error("Error executing questions query:", error);
        return callback(error, null);
      }

      const allQuestions = [];
      let processedCount = 0;

      // Loop through each question
      for (const question of questionsResult) {
        const tagsQuery = `
        SELECT
          t.id, t.name
        FROM
          tags t
        JOIN
          question_tag_mapping qtm ON t.id = qtm.tag_id
        WHERE
          qtm.question_id = ?
      `;

        pool.query(tagsQuery, [question.id], (tagsError, tagsResult) => {
          if (tagsError) {
            console.error("Error executing tags query:", tagsError);
            return callback(tagsError, null);
          }

          const tags = Array.isArray(tagsResult)
            ? tagsResult.map((tag) => ({ id: tag.id, name: tag.name }))
            : [];

          const imagesQuery = `
          SELECT
            url, size
          FROM
            question_images
          WHERE
            question_id = ?
        `;

          pool.query(
            imagesQuery,
            [question.id],
            (imagesError, imagesResult) => {
              if (imagesError) {
                console.error("Error executing images query:", imagesError);
                return callback(imagesError, null);
              }

              const urls = Array.isArray(imagesResult)
                ? imagesResult.map((image) => ({
                    url: image.url,
                    size: image.size,
                  }))
                : [];

              const formattedQuestion = {
                questionId: question.id,
                questionTitle: question.title,
                description: question.description,
                userId: question.user_id,
                username: question.username,
                avatarUrl: question.avatar_url, // Include avatar URL
                created_at: question.created_at,
                updated_at: question.updated_at,
                tags: tags,
                images: urls,
                votes: 0,
                answers: question.answer_count,
                views: 0,
                hasRecommendations: question.has_recommendations === 1, // Convert 1/0 to boolean
              };

              allQuestions.push(formattedQuestion);

              // Check if all questions have been processed
              processedCount++;
              if (processedCount === questionsResult.length) {
                return callback(null, allQuestions);
              }
            }
          );
        });
      }
    }
  );
};


const getRecentQuestions = async (callback) => {
  const allQuestionsQuery = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.user_id,
      q.created_at,
      q.updated_at,
      u.username,
      pi.url as avatar_url,
      (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) as answer_count,
      CASE WHEN r.question_id IS NOT NULL THEN 1 ELSE 0 END as has_recommendations
    FROM
      questions q
    JOIN
      users u ON q.user_id = u.id
    LEFT JOIN
      profile_images pi ON q.user_id = pi.user_id
    LEFT JOIN
      recommendations r ON q.id = r.question_id
    ORDER BY
      q.created_at DESC
    LIMIT 100
  `;

  pool.query(allQuestionsQuery, (error, questionsResult) => {
    if (error) {
      console.error("Error executing questions query:", error);
      return callback(error, null);
    }

    const allQuestions = [];
    let processedCount = 0;

    if (questionsResult.length === 0) {
      return callback(null, allQuestions); // Return empty array if no questions found
    }

    questionsResult.forEach((question) => {
      const tagsQuery = `
        SELECT
          t.id, t.name
        FROM
          tags t
        JOIN
          question_tag_mapping qtm ON t.id = qtm.tag_id
        WHERE
          qtm.question_id = ?
      `;

      pool.query(tagsQuery, [question.id], (tagsError, tagsResult) => {
        if (tagsError) {
          console.error("Error executing tags query:", tagsError);
          return callback(tagsError, null);
        }

        const tags = Array.isArray(tagsResult)
          ? tagsResult.map((tag) => ({ id: tag.id, name: tag.name }))
          : [];

        const imagesQuery = `
          SELECT
            url, size
          FROM
            question_images
          WHERE
            question_id = ?
        `;

        pool.query(imagesQuery, [question.id], (imagesError, imagesResult) => {
          if (imagesError) {
            console.error("Error executing images query:", imagesError);
            return callback(imagesError, null);
          }

          const urls = Array.isArray(imagesResult)
            ? imagesResult.map((image) => ({
                url: image.url,
                size: image.size,
              }))
            : [];

          const formattedQuestion = {
            questionId: question.id,
            questionTitle: question.title,
            description: question.description,
            userId: question.user_id,
            username: question.username,
            avatarUrl: question.avatar_url,
            created_at: question.created_at,
            updated_at: question.updated_at,
            tags: tags,
            images: urls,
            votes: 0,
            answers: question.answer_count,
            views: 0,
            hasRecommendations: question.has_recommendations === 1, // Convert 1/0 to boolean
          };

          allQuestions.push(formattedQuestion);

          processedCount++;
          if (processedCount === questionsResult.length) {
            return callback(null, allQuestions);
          }
        });
      });
    });
  });
};


const getUserQuestions = async (userId, callback) => {
  const userQuestionsQuery = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.user_id,
      q.created_at,
      q.updated_at,
      u.username,
      pi.url as avatar_url,
      (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) as answer_count,
      CASE WHEN r.question_id IS NOT NULL THEN 1 ELSE 0 END as has_recommendations
    FROM
      questions q
    JOIN
      users u ON q.user_id = u.id
    LEFT JOIN
      profile_images pi ON q.user_id = pi.user_id
    LEFT JOIN
      recommendations r ON q.id = r.question_id
    WHERE
      q.user_id = ?
    ORDER BY
      q.created_at DESC
    LIMIT 100
  `;

  pool.query(userQuestionsQuery, [userId], (error, questionsResult) => {
    if (error) {
      console.error("Error executing user questions query:", error);
      return callback(error, null);
    }

    const userQuestions = [];
    let processedCount = 0;

    if (questionsResult.length === 0) {
      return callback(null, userQuestions); // Return empty array if no questions found
    }

    questionsResult.forEach((question) => {
      const tagsQuery = `
        SELECT
          t.id, t.name
        FROM
          tags t
        JOIN
          question_tag_mapping qtm ON t.id = qtm.tag_id
        WHERE
          qtm.question_id = ?
      `;

      pool.query(tagsQuery, [question.id], (tagsError, tagsResult) => {
        if (tagsError) {
          console.error("Error executing tags query:", tagsError);
          return callback(tagsError, null);
        }

        const tags = Array.isArray(tagsResult)
          ? tagsResult.map((tag) => ({ id: tag.id, name: tag.name }))
          : [];

        const imagesQuery = `
          SELECT
            url, size
          FROM
            question_images
          WHERE
            question_id = ?
        `;

        pool.query(imagesQuery, [question.id], (imagesError, imagesResult) => {
          if (imagesError) {
            console.error("Error executing images query:", imagesError);
            return callback(imagesError, null);
          }

          const urls = Array.isArray(imagesResult)
            ? imagesResult.map((image) => ({
                url: image.url,
                size: image.size,
              }))
            : [];

          const formattedQuestion = {
            questionId: question.id,
            questionTitle: question.title,
            description: question.description,
            userId: question.user_id,
            username: question.username,
            avatarUrl: question.avatar_url,
            created_at: question.created_at,
            updated_at: question.updated_at,
            tags: tags,
            images: urls,
            votes: 0,
            answers: question.answer_count,
            views: 0,
            hasRecommendations: question.has_recommendations === 1, // Convert 1/0 to boolean
          };

          userQuestions.push(formattedQuestion);

          processedCount++;
          if (processedCount === questionsResult.length) {
            return callback(null, userQuestions);
          }
        });
      });
    });
  });
};


const deleteQuestion = async (questionId, callback) => {
  const query = `DELETE FROM questions WHERE id = ?`;

  pool.query(query, [questionId], (error, result) => {
    if (error) {
      return callback(error, null);
    } else {
      callback(null, questionId);
    }
  });
};

const getNotificationsWithUrls = (userId, callback) => {
  const query = `
    SELECT
      qn.notification_id,
      qn.user_id,
      u.username AS notifier_username,
      CONCAT('http://localhost:3000/knowledge-share/', REPLACE(REPLACE(u.username, ' ', '-'), '.', '-'), '/questions/', qn.question_id) AS question_url,
      qn.notification_message,
      qn.created_at,
      qn.is_seen,
      qn.seen_at
    FROM
      question_notifications qn
    JOIN
      questions q ON qn.question_id = q.id
    JOIN
      users u ON q.user_id = u.id
    WHERE
      qn.user_id = ?
    ORDER BY
      qn.created_at DESC;
  `;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error executing notifications query:", error);
      return callback(error, null);
    }

    // Process the results as needed
    const notifications = results.map((row) => ({
      notificationId: row.notification_id,
      userId: row.user_id,
      notifierUsername: row.notifier_username,
      questionUrl: row.question_url,
      notificationMessage: row.notification_message,
      createdAt: row.created_at,
      isSeen: row.is_seen,
      seenAt: row.seen_at,
    }));

    callback(null, notifications);
  });
};

const markNotificationAsSeen = (notificationId, userId, callback) => {
  const query = `
    UPDATE question_notifications
    SET is_seen = TRUE, seen_at = CURRENT_TIMESTAMP
    WHERE notification_id = ? AND user_id = ?
  `;

  // Execute the query using your database connection
  pool.query(query, [notificationId, userId], (error, result) => {
    if (error) {
      return callback(error, null);
    } else {
      callback(null, notificationId);
    }
  });
};

module.exports = {
  saveImage,
  saveQuestionTags,
  saveQuestion,
  getQuestionDetails,
  getAllQuestions,
  saveAnswer,
  getAllQuestionsTagged,
  getRecentQuestions,
  getUserQuestions,
  deleteQuestion,
  getNotificationsWithUrls,
  markNotificationAsSeen,
};
