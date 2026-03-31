const express = require("express");
const cors = require("cors");
require("./config/db");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const app = express();
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use(cors());
app.use(express.json());

const routes = require("./routes/transactionRoutes");
app.use("/api/transactions", routes);

app.get("/", (req, res) => {
  res.send("Expense Tracker API Running 🚀");
});

app.listen(5000, () => console.log("Server running on port 5000"))mongoose.connect(process.env.MONGO_URI);