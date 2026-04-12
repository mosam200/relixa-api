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

// Clean response (IMPORTANT FIX)
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

    // Greeting
    if (isGreeting(message)) {
      return res.json({
        reply: arabic
          ? `👋 أهلاً! أنا مساعد RELIXA.\nأقدر أساعدك في اختيار المنتج المناسب.\n\n🛒 أنصحك بـ:\n👉 ${PRODUCT.url}`
          : `👋 Hey! I'm your RELIXA assistant.\nI can help you improve posture and comfort.\n\n🛒 I recommend:\n👉 ${PRODUCT.url}`,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 120, // ✅ prevents long cut responses
      messages: [
        {
          role: "system",
          content: arabic
            ? `أنت مساعد متجر. 
- رد بشكل قصير جداً
- ركز على الفائدة
- رشّح المنتج مباشرة`
            : `You are a Shopify assistant.
- Keep replies short
- Focus on benefits
- Recommend the product clearly`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let reply = completion.choices[0].message.content;

    // ✅ CLEAN TEXT (FIX CUT/GLUE ISSUE)
    reply = cleanText(reply);

    // ✅ FORCE CLEAN CTA SEPARATION
    const finalReply = arabic
      ? `${reply}\n\n🛒 اطلب الآن:\n👉 ${PRODUCT.url}`
      : `${reply}\n\n🛒 Buy now:\n👉 ${PRODUCT.url}`;

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
