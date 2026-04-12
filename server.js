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

// Detect greeting
function isGreeting(text) {
  const t = text.toLowerCase().trim();
  return (
    ["hi", "hello", "hey"].includes(t) ||
    ["مرحبا", "اهلا", "أهلا", "سلام"].includes(text)
  );
}

// REMOVE ANY URL (CRITICAL FIX)
function removeLinks(text) {
  return text.replace(/https?:\/\/\S+/g, "").replace(/www\.\S+/g, "");
}

// FORCE SHORT CLEAN TEXT
function cleanText(text) {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "RELIXA AI running 🚀" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message || "";
    const arabic = isArabic(message);

    // ✅ GREETING
    if (isGreeting(message)) {
      return res.json({
        reply: arabic
          ? `👋 أهلاً! أنا مساعد RELIXA.\n\n🛒 أنصحك بـ:\n👉 ${PRODUCT.url}`
          : `👋 Hey! I'm your RELIXA assistant.\n\n🛒 I recommend:\n👉 ${PRODUCT.url}`,
      });
    }

    // ✅ AI RESPONSE (STRICT CONTROL)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 40, // 🔥 VERY SHORT
      messages: [
        {
          role: "system",
          content: arabic
            ? "أجب بجملة قصيرة جداً عن فوائد posture corrector بدون روابط."
            : "Reply in ONE short sentence about posture corrector benefits. NO links.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let aiReply = completion.choices[0].message.content;

    // ❗ REMOVE ANY AI LINK (HARD FIX)
    aiReply = removeLinks(aiReply);

    // ❗ CLEAN TEXT
    aiReply = cleanText(aiReply);

    // ❗ FALLBACK (IF AI IS BAD)
    if (!aiReply || aiReply.length < 5) {
      aiReply = arabic
        ? "يساعد في تحسين وضعيتك وتقليل الألم."
        : "Improves posture and reduces back pain.";
    }

    // ✅ FINAL PERFECT OUTPUT
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
