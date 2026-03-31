const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");

router.post("/", controller.addTransaction);
router.get("/", controller.getTransactions);
router.delete("/:id", controller.deleteTransaction);
router.get("/summary", controller.getSummary);

module.exports = router;