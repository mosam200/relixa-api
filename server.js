import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Root route (optional but useful)
app.get("/", (req, res) => {
  res.send("RELIXA AI API is running 🚀");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a Shopify store. Help customers, recommend products, answer questions, and encourage purchases.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
