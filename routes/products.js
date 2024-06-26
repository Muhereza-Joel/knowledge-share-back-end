const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const productQueries = require("../mysql/queries/productQueries");

// Configure Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/images";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Helper function to generate image URLs
const generateImageUrls = (req) => {
  return req.files.map((file) => {
    return `${req.protocol}://${req.get("host")}/${file.path}`;
  });
};

// GET all products
router.get("/all", (req, res) => {
  productQueries.getAllProducts((error, products) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.status(200).json(products);
  });
});

router.get("/all/:productId", (req, res) => {
  const productId = req.params.productId;

  productQueries.getProductDetails(productId, (error, products) => {
    if (error) {
      console.error("Error fetching product details:", error);
      return res.status(500).json({ error: "Failed to fetch product details" });
    }
    res.status(200).json(products);
  });
});

router.get("/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;
  productQueries.getAllProductsByCategory(categoryId, (error, products) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.status(200).json(products);
  });
});


// POST a new product
router.post("/add", upload.array("image", 10), (req, res) => {
  try {
    const { productName, productDescription, price, quantity, categories } =
      req.body;
    const imageUrls = generateImageUrls(req);

    const newProduct = {
      id: uuidv4(),
      productName,
      productDescription,
      price,
      quantity,
      imageUrls,
      categories: JSON.parse(categories), // Assuming categories is a JSON string of category IDs
    };

    productQueries.addProduct(newProduct, (error, productId) => {
      if (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Failed to add product" });
      }
      res
        .status(201)
        .json({
          message: "Product added successfully",
          product: { ...newProduct, id: productId },
        });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// PUT update a product
router.put("/product/:id", upload.array("image", 10), (req, res) => {
  try {
    const productId = req.params.id;
    const { productName, productDescription, price, quantity, categories } =
      req.body;
    const imageUrls = generateImageUrls(req);

    const updatedProduct = {
      productName,
      productDescription,
      price,
      quantity,
      imageUrls,
      categories: JSON.parse(categories),
    };

    productQueries.updateProduct(
      productId,
      updatedProduct,
      (error, results) => {
        if (error) {
          console.error("Error updating product:", error);
          return res.status(500).json({ error: "Failed to update product" });
        }
        res
          .status(200)
          .json({
            message: "Product updated successfully",
            product: updatedProduct,
          });
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE a product
router.delete("/product/:id", (req, res) => {
  try {
    const productId = req.params.id;
    productQueries.deleteProduct(productId, (error, results) => {
      if (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "Failed to delete product" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
