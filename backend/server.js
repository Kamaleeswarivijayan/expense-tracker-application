require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Expense Tracker API Running 🚀");
});
// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Expense Tracker API Running 🚀");
});

// CONNECT DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
