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

// Product info (your store)
const PRODUCT = {
  name: "Posture Corrector",
  url: "https://relixa-8727.myshopify.com/products/posture-corrector",
};

// Helper: detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// FREE responses (no OpenAI call)
function handleSimpleMessages(message) {
  const msg = message.toLowerCase();

  const greetings = ["hi", "hello", "hey", "سلام", "مرحبا"];
  const thanks = ["thanks", "thank you", "شكرا"];

  // Greeting
  if (greetings.some(g => msg.includes(g))) {
    return isArabic(message)
      ? `أهلاً 👋 كيف أقدر أساعدك؟ أنصحك بـ ${PRODUCT.name} لتحسين وضعيتك بسهولة.\n\n🛒 ${PRODUCT.url}`
      : `Hey 👋 How can I help?\nI recommend our ${PRODUCT.name} to improve your posture easily.\n\n🛒 ${PRODUCT.url}`;
  }

  // Thanks
  if (thanks.some(t => msg.includes(t))) {
    return isArabic(message)
      ? `على الرحب والسعة 😊 إذا احتجت أي شيء، جرب ${PRODUCT.name}.\n\n🛒 ${PRODUCT.url}`
      : `You're welcome 😊 If you need anything, check out our ${PRODUCT.name}.\n\n🛒 ${PRODUCT.url}`;
  }

  // Ignore very short messages (save money)
  if (message.trim().length < 3) {
    return null;
  }

  return null;
}

// Health check
app.get("/", (req, res) => {
  res.send("RELIXA AI running 🚀");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 1️⃣ Handle FREE simple messages
    const simpleReply = handleSimpleMessages(message);
    if (simpleReply) {
      return res.json({ reply: simpleReply });
    }

    // 2️⃣ Detect language
    const arabic = isArabic(message);

    // 3️⃣ OpenAI call ONLY when needed
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cheap & good
      messages: [
        {
          role: "system",
          content: arabic
            ? "أنت مساعد متجر ذكي. كن مختصرًا، مفيدًا، وأوصِ دائمًا بمنتج تصحيح القوام."
            : "You are a smart store assistant. Be short, helpful, and ALWAYS recommend the posture corrector product.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150, // COST CONTROL
      temperature: 0.7,
    });

    let reply = completion.choices[0].message.content;

    // 4️⃣ ALWAYS add product (sales focus)
    if (arabic) {
      reply += `\n\n🛒 أنصحك بـ ${PRODUCT.name}:\n${PRODUCT.url}`;
    } else {
      reply += `\n\n🛒 I recommend our ${PRODUCT.name}:\n${PRODUCT.url}`;
    }

    res.json({ reply });

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
