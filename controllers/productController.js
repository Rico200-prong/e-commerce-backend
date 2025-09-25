const Product = require("../models/Product.models");
const mongoose = require("mongoose");

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === "true") {
      filter.inStock = true;
      filter.stockQuantity = { $gt: 0 };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    //Execute query
    const product = await Product.find(filter)
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    //Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: Products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: skip + Products.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product Id",
      });
    }

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      messaage: "Error fetching products",
      error: error.message,
    });
  }
};

// Create new product (protectd - requires authentication)
const createProduct = async (req, res) => {
  try {
    const ProductData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const product = new Product(productData);
    await product.save();

    // Populate the createdBy firld for response
    await product.populate("createdBy", "name email");
    res.status(201).json({
      success: true,
      message: "Product created successfuly",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// Update product (protected- requires authentication)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.mesage,
    });
  }
};

// Delete product (soft delete - just mark as inactive)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.mesage,
    });
  }
};

// Get product by category
const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    const prodyucts = await Product.find({
      category: category,
      isActive: true,
    })
      .populate("createBy", "name email")
      .sort({ "rating.average": -1, cratedAt: -1 })
      .limit(Number(limits));
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product by category",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByCategory,
};
