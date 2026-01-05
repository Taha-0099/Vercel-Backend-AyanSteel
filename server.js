// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const ledgerRoutes = require("./routes/ledgerRoutes");
const clientRoutes = require("./routes/clientRoutes");
const companyBalanceRoutes = require("./routes/companyBalanceRoutes");
const stockRoutes = require("./routes/stockRoutes");
const supplierLedgerRoutes = require("./routes/supplierLedgerRoutes");
const supplierPaymentRoutes = require("./routes/supplierPaymentRoutes");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: "*", // allow all (safe for now, can restrict later)
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

/* ---------- MONGODB ---------- */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ---------- ROUTES ---------- */

// Ledger
app.use("/api/ledger", ledgerRoutes);
app.use("/ledger", ledgerRoutes);

// Clients
app.use("/api/clients", clientRoutes);
app.use("/clients", clientRoutes);

// Company balance
app.use("/api/company-balance", companyBalanceRoutes);

// Supplier
app.use("/api/supplier-ledger", supplierLedgerRoutes);
app.use("/api/supplier-payments", supplierPaymentRoutes);

// Stock
app.use("/api/stock", stockRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Ledger backend running");
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
