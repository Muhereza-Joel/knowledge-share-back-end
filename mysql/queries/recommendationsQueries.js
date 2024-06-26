const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const saveRecommendation = (recommendationData, callback) => {
  const { questionId, selectedProducts, directions } = recommendationData;

  // Convert selectedProducts array to a JSON string
  const productIdsJSON = JSON.stringify(selectedProducts);

  const query = `
      INSERT INTO recommendations (question_id, product_ids, directions)
      VALUES (?, ?, ?)
    `;
  const values = [questionId, productIdsJSON, directions];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error("Error saving recommendation:", error);
      return callback(error);
    }
    callback(null);
  });
};

const getQuestionRecommendations = (questionId, callback) => {
  const query = `
      SELECT 
          r.question_id,
          r.product_ids,
          JSON_ARRAYAGG(JSON_OBJECT(
              'id', p.id,
              'product_name', p.product_name,
              'product_description', p.product_description,
              'price', p.price,
              'quantity', p.quantity,
              'image_urls', (
                  SELECT JSON_ARRAYAGG(pi.image_urls)
                  FROM products pi
                  WHERE pi.id = p.id
              ),
              'status', p.status
          )) as products,
          r.directions,
          q.title,
          q.description,
          q.user_id,
          r.created_at,
          r.updated_at
      FROM 
          recommendations r
      JOIN 
          questions q ON q.id = r.question_id
      LEFT JOIN 
          products p ON JSON_CONTAINS(r.product_ids, JSON_QUOTE(p.id), '$')
      WHERE 
          r.question_id = ?
      GROUP BY 
          r.question_id, r.product_ids, r.directions, q.title, q.description, q.user_id, r.created_at, r.updated_at
      LIMIT 0, 25;
    `;
  const values = [questionId];

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("Error retrieving recommendations:", error);
      return callback(error);
    }

    if (results.length === 0) {
      return callback(null, []);
    }

    const recommendations = results.map((result) => ({
      question_id: result.question_id,
      product_ids: JSON.parse(result.product_ids),
      products: JSON.parse(result.products).map((product) => ({
        ...product,
        image_urls: JSON.parse(product.image_urls[0]), // Correctly parse the image URLs
      })),
      directions: result.directions,
      title: result.title,
      description: result.description,
      user_id: result.user_id,
      created_at: result.created_at,
      updated_at: result.updated_at,
    }));

    callback(null, recommendations);
  });
};


module.exports = {
  saveRecommendation,
  getQuestionRecommendations,
};
