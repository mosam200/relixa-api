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
  const t = text.toLowerCase().trim();
  return (
    ["hi", "hello", "hey", "yo"].includes(t) ||
    ["مرحبا", "اهلا", "أهلا", "سلام"].includes(text)
  );
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "RELIXA AI running 🚀" });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message || "";
    const arabic = isArabic(message);

    // ✅ HANDLE GREETING (FIXED ISSUE)
    if (isGreeting(message)) {
      return res.json({
        reply: arabic
          ? `👋 أهلاً! أنا مساعد RELIXA.\nأقدر أساعدك تختار أفضل منتج لتحسين وضعيتك.\n\n🛒 أنصحك بـ:\n👉 ${PRODUCT.url}`
          : `👋 Hey! I'm your RELIXA assistant.\nI can help you improve your posture and comfort.\n\n🛒 I recommend:\n👉 ${PRODUCT.url}`,
      });
    }

    // AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: arabic
            ? `أنت مساعد متجر إلكتروني احترافي. 
- تحدث بالعربية
- قدم توصيات واضحة
- ركز على الفائدة (تخفيف الألم، تحسين الوضعية)
- دائماً رشّح منتج posture corrector
- كن مختصر ومقنع`
            : `You are a high-converting Shopify assistant.
- Be clear and persuasive
- Focus on benefits (posture, pain relief, comfort)
- Always recommend the posture corrector
- Keep it short and actionable`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let reply = completion.choices[0].message.content;

    // Always add product CTA
    reply += arabic
      ? `\n\n🛒 اطلب الآن:\n👉 ${PRODUCT.url}`
      : `\n\n🛒 Buy now:\n👉 ${PRODUCT.url}`;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI failed",
      details: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
