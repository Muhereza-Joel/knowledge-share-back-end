const pool = require("../databaseConnection");

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

const getAllQuestions = (callback) => {
    const allQuestionsQuery = `
      SELECT
        q.id,
        q.title,
        q.description,
        q.user_id,
        q.created_at,
        q.updated_at,
        u.username
      FROM
        questions q
      JOIN
        users u ON q.user_id = u.id
    `;
  
    pool.query(allQuestionsQuery, (error, questionsResult) => {
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
  
          pool.query(imagesQuery, [question.id], (imagesError, imagesResult) => {
            if (imagesError) {
              console.error("Error executing images query:", imagesError);
              return callback(imagesError, null);
            }
  
            const urls = Array.isArray(imagesResult)
              ? imagesResult.map((image) => ({ url: image.url, size: image.size }))
              : [];
  
            const formattedQuestion = {
              questionId: question.id,
              questionTitle: question.title,
              description: question.description,
              userId: question.user_id,
              username: question.username,
              created_at: question.created_at,
              updated_at: question.updated_at,
              tags: tags,
              images: urls,
              votes: 0,
              answers: 0,
              views: 0,
            };
  
            allQuestions.push(formattedQuestion);
  
            // Check if all questions have been processed
            processedCount++;
            if (processedCount === questionsResult.length) {
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
        q.user_id,
        q.created_at,
        q.updated_at,
        u.username
      FROM
        questions q
      JOIN
        users u ON q.user_id = u.id
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
            url,size
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

        const formattedQuestion = {
          questionId: question.id,
          questionTitle: question.title,
          description: question.description,
          userId: question.user_id,
          username: question.username,
          created_at: question.created_at,
          updated_at: question.updated_at,
          tags: tags,
          images: urls,
          votes: 0,
          answers: 0,
          views: 0,
        };

        return callback(null, formattedQuestion);
      });
    });
  });
};

module.exports = {
  saveImage,
  saveQuestionTags,
  saveQuestion,
  getQuestionDetails,
  getAllQuestions,
};
