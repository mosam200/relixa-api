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
  const t = text.toLowerCase().trim();
  return (
    ["hi", "hello", "hey"].includes(t) ||
    ["مرحبا", "اهلا", "أهلا", "سلام"].includes(text)
  );
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "RELIXA AI running 🚀" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message || "";
    const arabic = isArabic(message);

    // ✅ GREETING (FIXED)
    if (isGreeting(message)) {
      return res.json({
        reply: arabic
          ? `👋 أهلاً! أنا مساعد RELIXA.\n\n🛒 أنصحك بـ:\n👉 ${PRODUCT.url}`
          : `👋 Hey! I'm your RELIXA assistant.\n\n🛒 I recommend:\n👉 ${PRODUCT.url}`,
      });
    }

    // ✅ AI (SHORT ONLY — NO LINKS)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 60, // 🔥 VERY IMPORTANT (prevents cutting)
      messages: [
        {
          role: "system",
          content: arabic
            ? "أجب بجملة قصيرة جداً تشرح فائدة posture corrector بدون أي روابط."
            : "Answer in one short sentence explaining benefits of a posture corrector. No links.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let aiReply = completion.choices[0].message.content.trim();

    // ❗ HARD CLEAN (REMOVE ANY URL FROM AI)
    aiReply = aiReply.replace(/https?:\/\/\S+/g, "");

    // ✅ FINAL CONTROLLED OUTPUT (PERFECT FORMAT)
    const finalReply = arabic
      ? `${aiReply}\n\n🛒 اطلب الآن:\n👉 ${PRODUCT.url}`
      : `${aiReply}\n\n🛒 Buy now:\n👉 ${PRODUCT.url}`;

    res.json({ reply: finalReply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
