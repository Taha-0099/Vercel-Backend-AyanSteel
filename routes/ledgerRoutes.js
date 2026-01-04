import express from "express";
import Ledger from "../models/Ledger.js";

const router = express.Router();

/* GET all ledger */
router.get("/", async (req, res) => {
  try {
    const data = await Ledger.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("Ledger fetch error:", error);
    res.status(500).json({ message: "Failed to fetch ledger" });
  }
});

/* POST ledger */
router.post("/", async (req, res) => {
  try {
    const ledger = new Ledger(req.body);
    await ledger.save();
    res.status(201).json(ledger);
  } catch (error) {
    console.error("Ledger save error:", error);
    res.status(500).json({ message: "Failed to save ledger" });
  }
});

export default router;
