const express = require("express");
const {
  getAllProducts,
  createProduct,
} = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.post("/", createProduct);

module.exports = router;
