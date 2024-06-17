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
        console.error('Error saving recommendation:', error);
        return callback(error);
      }
      callback(null);
    });
  };
  

module.exports = {
  saveRecommendation,
};
