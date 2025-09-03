const express = require("express");

const router = express.Router();

// Public
router.get("/", getAllProducts);
