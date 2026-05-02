const Transaction = require("../models/transactionModel");

// CREATE
exports.addTransaction = async (req, res) => {
  try {
    const data = await Transaction.create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
};

// READ
exports.getTransactions = async (req, res) => {
  const data = await Transaction.find();
  res.json(data);
};

// DELETE
exports.deleteTransaction = async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.send("Deleted");
};

// SUMMARY (IMPORTANT 💯)
exports.getSummary = async (req, res) => {
  const data = await Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);
  res.json(data);
};
