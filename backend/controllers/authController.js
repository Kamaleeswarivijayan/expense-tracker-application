const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    email: req.body.email,
    password: hashed
  });

  res.json(user);
};

// LOGIN
exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({ token });
};