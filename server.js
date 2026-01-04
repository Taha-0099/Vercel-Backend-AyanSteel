import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";

dotenv.config();

const app = express();

/* ✅ CORS FIX */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

/* ✅ Connect DB ONCE */
connectDB();

/* ✅ Routes */
app.use("/api/ledger", ledgerRoutes);

/* ✅ Health check */
app.get("/", (req, res) => {
  res.send("API is running");
});

/* ❌ DO NOT USE app.listen() ON VERCEL */
export default app;
