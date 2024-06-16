const pool = require("../databaseConnection");
const { v4: uuidv4 } = require("uuid");

const getAllProducts = (callback) => {
  const query = `SELECT 
      p.*, 
      GROUP_CONCAT(pc.name SEPARATOR ', ') AS categories
    FROM 
      products p
      LEFT JOIN 
      product_category_mapping cm ON p.id = cm.product_id
    LEFT JOIN 
      product_categories pc ON pc.id = cm.category_id
    GROUP BY 
      p.id`;
  pool.query(query, (error, results) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};

const addProduct = (newProduct, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return callback(err);
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return callback(err);
      }

      const productQuery =
        "INSERT INTO products (id, product_name, product_description, price, quantity, image_urls) VALUES (?, ?, ?, ?, ?, ?)";
      const productValues = [
        newProduct.id,
        newProduct.productName,
        newProduct.productDescription,
        newProduct.price,
        newProduct.quantity,
        JSON.stringify(newProduct.imageUrls),
      ];

      connection.query(productQuery, productValues, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error inserting product:", err);
            return callback(err);
          });
        }

        const categoryQueries = newProduct.categories.map((categoryId) => {
          return new Promise((resolve, reject) => {
            const categoryQuery =
              "INSERT INTO product_category_mapping (product_id, category_id) VALUES (?, ?)";
            connection.query(
              categoryQuery,
              [newProduct.id, categoryId],
              (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              }
            );
          });
        });

        Promise.all(categoryQueries)
          .then(() => {
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error committing transaction:", err);
                  return callback(err);
                });
              }
              connection.release();
              callback(null, newProduct.id);
            });
          })
          .catch((err) => {
            connection.rollback(() => {
              connection.release();
              console.error("Error inserting product categories:", err);
              callback(err);
            });
          });
      });
    });
  });
};

const updateProduct = (id, product, callback) => {
  const {
    productName,
    productDescription,
    price,
    quantity,
    imageUrls,
    categories,
  } = product;
  pool.query(
    "UPDATE products SET productName = ?, productDescription = ?, price = ?, quantity = ?, imageUrls = ?, categories = ? WHERE id = ?",
    [
      productName,
      productDescription,
      price,
      quantity,
      JSON.stringify(imageUrls),
      JSON.stringify(categories),
      id,
    ],
    (error, results) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, results);
    }
  );
};

const deleteProduct = (id, callback) => {
  pool.query("DELETE FROM products WHERE id = ?", [id], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
