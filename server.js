// import the packages we installed
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cors = require("cors");

// enables usage of .env files - this must be at the topmost part of your server/app/index.js file
require("dotenv").config();

// create the expres app
const app = express();

// setup middlwares (code that runs for every request)
app.use(cors());
app.use(express.json());

// our port
const PORT = process.env.PORT || 5000;

// create endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello! this is the home endpont of our backend",
    data: {
      name: "e-commerce-backend datum",
      class: "feb 2025 class",
      efficiency: "Beginner",
    },
  });
});

// actual endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// connect DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connection Successful");
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
  }
};

connectDB();

// start server
app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
