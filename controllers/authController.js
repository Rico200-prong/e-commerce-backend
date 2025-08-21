const User = require("../models/User.models");
const jwt = require("jsonwebtoken");

// Helper functio to create tokens
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if the user alreaady exist
    const existingUser = await User.findOne({ email });

    //if true then send an error message
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    //if the email is not found in the database
    const user = new User({ name, email, password });

    await user.save();

    // create token for user
    const token = createToken(user._id);

    // send response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Encountered errors registering users, please try again later",
      error: error.message,
    });
  }
};

module.exports = { register };
