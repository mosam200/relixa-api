import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Chat endpoint (RELIXA)
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // TEMP response (we'll connect AI later)
  res.json({
    reply: `You said: ${message}`,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
