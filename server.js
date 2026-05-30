import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ================================
   RELIXA SYSTEM PROMPT
================================ */

const SYSTEM_PROMPT = `You are Relixa's AI support agent — a smart, warm assistant for a premium GCC health brand.

Relixa products:
- FRAME™: Posture corrector / upper back support. For desk workers, back pain. URL: https://relixa-8727.myshopify.com/products/relixa-frame
- FLOW PRO™: Dynamic knee stabilizer. For runners, athletes, knee pain. URL: https://relixa-8727.myshopify.com/products/relixa-flow-pro
- FLOW LITE™: Precision ankle stabilizer. For ankle sprains, stability. URL: https://relixa-8727.myshopify.com/products/relixa-flow-lite
- RELIXA SYSTEM™: Full bundle (FRAME + FLOW PRO + FLOW LITE). Best value. URL: https://relixa-8727.myshopify.com/products/relixa-system

Rules:
- Respond in the same language the customer uses (Arabic or English)
- Be warm, concise, helpful — max 3 short sentences
- If they mention back/posture → recommend FRAME™
- If they mention knee → recommend FLOW PRO™  
- If they mention ankle → recommend FLOW LITE™
- If they mention multiple issues → recommend RELIXA SYSTEM™
- Always include the product URL when recommending
- For orders/shipping: free delivery in Bahrain, COD available, visit relixa.com
- Never make up information`;

/* ================================
   CHAT ENDPOINT
================================ */

app.post("/api/chat", async (req, res) => {
  try {
    const { message, agent, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided." });
    }

    // Build agent-specific system prompt
    let systemPrompt = SYSTEM_PROMPT;

    if (agent === "sales") {
      systemPrompt += "\n\nYou are specifically the SALES agent. Focus on recommending products, handling objections, and upselling to RELIXA SYSTEM™ when appropriate. Be persuasive but honest.";
    } else if (agent === "content") {
      systemPrompt += "\n\nYou are the CONTENT agent. Generate ad copy, TikTok scripts, product descriptions, and marketing content for Relixa. Always give 2 variations when asked for copy.";
    } else if (agent === "analytics") {
      systemPrompt += "\n\nYou are the ANALYTICS agent. Help the store owner interpret sales data, ROAS, conversion rates, and suggest actionable decisions. Be data-driven and practical.";
    }

    // Build message history
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages
    });

    const reply = response.content[0]?.text || "Sorry, I couldn't generate a response.";
    res.json({ reply });

  } catch (error) {
    console.error("Claude API error:", error?.message || error);
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
});

/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("Relixa AI running 🚀");
});

/* ================================
   START SERVER
================================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
