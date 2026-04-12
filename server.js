import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🛍️ YOUR STORE PRODUCTS
const products = [
  {
    name: "Posture Corrector",
    price: "$39",
    description: "Improves posture and relieves back pain",
    arabic: "حزام تصحيح القوام لتحسين الوقفة وتخفيف آلام الظهر"
  }
];

// ✅ Health check (Railway needs this)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// 💬 CHAT ENDPOINT
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `
You are a Shopify sales assistant for RELIXA.

STRICT RULES:
- ALWAYS recommend at least ONE product in EVERY reply.
- NEVER ask follow-up questions without giving a recommendation first.
- NEVER say you don't have enough information.
- NEVER act like a generic AI.

PRODUCT LIST:
${JSON.stringify(products)}

LANGUAGE RULE:
- If user writes in English → reply in English
- If user writes in Arabic → reply in Arabic

STYLE:
- Be confident and persuasive
- Focus on benefits (posture, comfort, pain relief)
- Keep it short and direct

EXAMPLES:

User: What should I buy?
Answer: I recommend our Posture Corrector. It helps improve posture, reduce back pain, and stay comfortable throughout the day.

User: I have back pain
Answer: I recommend our Posture Corrector. It supports your spine, reduces back pain, and improves posture effectively.

User (Arabic): وش تنصحني؟
Answer: أنصحك بحزام تصحيح القوام، يساعد على تحسين الوقفة وتخفيف آلام الظهر بشكل مريح يومياً.

User (Arabic): عندي ألم في ظهري
Answer: أنصحك بحزام تصحيح القوام، لأنه يدعم العمود الفقري ويخفف الألم ويحسن وضعيتك بشكل فعال.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR:", error.message);

    res.status(500).json({
      error: "AI failed",
      details: error.message
    });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
