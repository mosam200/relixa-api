import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Product
const PRODUCT = {
  name: "Posture Corrector",
  url: "https://relixa-8727.myshopify.com/products/posture-corrector",
};

// Detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// Greeting detection
function isGreeting(text) {
  const t = text.toLowerCase();
  return (
    t.includes("hello") ||
    t.includes("hi") ||
    t.includes("hey") ||
    t.includes("مرحبا") ||
    t.includes("سلام") ||
    t.includes("اهلا") ||
    t.includes("أهلا")
  );
}

// Health check
app.get("/", (req, res) => {
  res.send("RELIXA AI running ✅");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const arabic = isArabic(userMessage);

    // ✅ Greeting override
    if (isGreeting(userMessage)) {
      return res.json({
        reply: arabic
          ? "أهلاً 👋 كيف أقدر أساعدك اليوم؟"
          : "Hey 👋 How can I help you today?",
      });
    }

    // ✅ AI RESPONSE
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: arabic
            ? `
أنت مساعد متجر RELIXA.
دائمًا اقترح منتج واحد على الأقل.
اكتب بالعربية فقط.
اجعل الرد قصير وواضح.

المنتج:
Posture Corrector
${PRODUCT.url}
`
            : `
You are a RELIXA store assistant.
Always recommend at least one product.
Keep answers short and clear.

Product:
Posture Corrector
${PRODUCT.url}
`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply =
      completion.choices[0].message.content ||
      (arabic ? "حاول مرة أخرى." : "Try again.");

    res.json({ reply });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      reply: "Server error",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
