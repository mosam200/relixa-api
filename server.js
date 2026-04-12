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

// 🛒 PRODUCT (EDIT IF NEEDED)
const PRODUCT = {
  name: "Posture Corrector",
  url: "https://relixa-8727.myshopify.com/products/posture-corrector",
};

// 🌍 Detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// 💰 FREE RESPONSES (NO API CALL)
function handleSimpleMessages(message) {
  const msg = message.toLowerCase();

  const greetings = ["hi", "hello", "hey", "سلام", "مرحبا"];
  const thanks = ["thanks", "thank you", "شكرا", "thx"];

  // Greeting
  if (greetings.some(g => msg.includes(g))) {
    return isArabic(message)
      ? `أهلاً 👋 كيف أقدر أساعدك؟\nأنصحك بحزام تصحيح القوام لتحسين وضعيتك بسهولة.\n\n🛒 ${PRODUCT.url}`
      : `Hey 👋 How can I help?\nI recommend our Posture Corrector to improve your posture easily.\n\n🛒 ${PRODUCT.url}`;
  }

  // Thanks
  if (thanks.some(t => msg.includes(t))) {
    return isArabic(message)
      ? `على الرحب والسعة 😊\nإذا احتجت أي مساعدة، أنصحك بتجربة حزام تصحيح القوام.\n\n🛒 ${PRODUCT.url}`
      : `You're welcome 😊\nIf you need anything, check out our Posture Corrector.\n\n🛒 ${PRODUCT.url}`;
  }

  // VERY SHORT → ignore (save cost)
  if (message.trim().length < 2) {
    return isArabic(message)
      ? `ممكن توضح أكثر؟ 😊`
      : `Can you tell me a bit more? 😊`;
  }

  // IMPORTANT: everything else → AI
  return null;
}

// ❤️ Health check
app.get("/", (req, res) => {
  res.send("RELIXA AI running 🚀");
});

// 🤖 CHAT ENDPOINT
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 1️⃣ FREE responses
    const simpleReply = handleSimpleMessages(message);
    if (simpleReply) {
      return res.json({ reply: simpleReply });
    }

    // 2️⃣ Detect language
    const arabic = isArabic(message);

    // 3️⃣ OpenAI call (ONLY when needed)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: arabic
            ? "أنت مساعد متجر احترافي. رد بشكل مختصر، مقنع، وركز على بيع المنتج. دائماً اقترح حزام تصحيح القوام."
            : "You are a high-converting eCommerce assistant. Be persuasive, short, and always recommend the posture corrector.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    let reply = completion.choices[0].message.content;

    // 4️⃣ FORCE PRODUCT CTA (SALES)
    if (arabic) {
      reply += `\n\n🛒 اطلب الآن:\n${PRODUCT.url}`;
    } else {
      reply += `\n\n🛒 Buy now:\n${PRODUCT.url}`;
    }

    res.json({ reply });

  } catch (error) {
    console.error("ERROR:", error.message);

    res.status(500).json({
      error: "AI failed",
      details: error.message,
    });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
