const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");


const getAllCategories = (callback) => {
  let query = "SELECT * FROM product_categories";
  
  pool.query(query,[], (error, results) => {
    callback(error, results);
  });
};

const addCategory = (category, callback) => {
  const lowerCaseName = category.name.toLowerCase();
  
  // Check if the category name already exists
  const checkQuery = "SELECT * FROM product_categories WHERE LOWER(name) = ?";
  pool.query(checkQuery, [lowerCaseName], (checkError, checkResults) => {
    if (checkError) {
      callback(checkError, null);
    } else if (checkResults.length > 0) {
      callback("Category name already exists", null);
    } else {
      // If the category name does not exist, proceed to insert it
      const insertQuery = "INSERT INTO product_categories (id, name) VALUES (?, ?)";
      const values = [category.id, lowerCaseName];
      pool.query(insertQuery, values, (insertError, insertResults) => {
        if (insertError) {
          callback(insertError, null);
        } else {
          pool.query(
            "SELECT * FROM product_categories WHERE id = ?",
            [category.id],
            (selectError, selectResults) => {
              callback(selectError, selectResults[0]);
            }
          );
        }
      });
    }
  });
};



const deleteCategory = (id, callback) => {
  const query = "DELETE FROM product_categories WHERE id = ?";
  pool.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null); 
    } else {
      callback(null, results); 
    }
  });
};

module.exports = {
  getAllCategories,  
  addCategory,
  deleteCategory
};
