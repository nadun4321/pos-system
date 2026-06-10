const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const sales = await Sale.find();
    const totalSales = sales.length;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySales = await Sale.find({ createdAt: { $gte: startOfDay } });
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    res.json({
      totalProducts,
      totalSales,
      todayRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
