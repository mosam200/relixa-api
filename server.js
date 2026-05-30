import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PRODUCTS = {
  frame: {
    name: "FRAME™ – Upper Body Alignment",
    url: "https://relixa-8727.myshopify.com/products/relixa-frame",
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/FRAME_posture_corrector_Sizes.png?v=1775145160"
  },
  flowpro: {
    name: "FLOW PRO™ – Knee Stabilizer",
    url: "https://relixa-8727.myshopify.com/products/relixa-flow-pro",
    image: "https://relixa-8727.myshopify.com/cdn/shop/files/8ed33ebc-74c2-48e0-951f-0f78a0e7cf9a.jpg?v=1774092264&width=400"
  },
  flowlite: {
    name: "FLOW LITE™ – Ankle Stabilizer",
    url: "https://relixa-8727.myshopify.com/products/relixa-flow-lite",
    image: "https://relixa-8727.myshopify.com/cdn/shop/files/ca6bf736-e25c-497d-9dfb-a5410432267e.jpg?v=1774090862&width=400"
  },
  system: {
    name: "RELIXA SYSTEM™ – Full Bundle",
    url: "https://relixa-8727.myshopify.com/products/relixa-system",
    image: "https://relixa-8727.myshopify.com/cdn/shop/files/RelixaSystem.png?v=1774225911&width=400"
  }
};

function productCard(product) {
  return `<div style="margin-top:8px;border:1px solid #eee;border-radius:10px;overflow:hidden;">
<a href="${product.url}" target="_blank"><img src="${product.image}" style="width:100%;display:block;" /></a>
<div style="padding:8px;">
<b>${product.name}</b><br/>
<a href="${product.url}" target="_blank" style="display:inline-block;margin-top:6px;background:black;color:white;padding:7px 14px;border-radius:6px;text-decoration:none;font-size:12px;">View Product →</a>
</div></div>`;
}

const SYSTEM_PROMPT = `You are Relixa's AI support agent for a premium GCC health brand.

Relixa products:
- FRAME™: Posture corrector / upper back support. For desk workers, back pain. keyword: [FRAME]
- FLOW PRO™: Dynamic knee stabilizer. For runners, athletes, knee pain. keyword: [FLOWPRO]
- FLOW LITE™: Precision ankle stabilizer. For ankle sprains. keyword: [FLOWLITE]
- RELIXA SYSTEM™: Full bundle — best value. keyword: [SYSTEM]

Rules:
- Respond in the same language the customer uses (Arabic or English)
- Be warm, concise — max 2-3 sentences
- When recommending a product, include its keyword tag like [FRAME] or [SYSTEM] at the end
- For multiple issues recommend [SYSTEM]
- For orders/shipping: free delivery in Bahrain, COD available
- Never make up information`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, agent, history = [] } = req.body;
    if (!message) return res.status(400).json({ reply: "No message provided." });

    let systemPrompt = SYSTEM_PROMPT;
    if (agent === "sales") systemPrompt += "\n\nYou are the SALES agent. Be persuasive, handle objections, upsell to [SYSTEM].";
    else if (agent === "content") systemPrompt += "\n\nYou are the CONTENT agent. Generate TikTok scripts, ad hooks, product descriptions. Give 2 variations.";
    else if (agent === "analytics") systemPrompt += "\n\nYou are the ANALYTICS agent. Interpret sales data, ROAS, AOV. Be practical and data-driven.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({ model: "gpt-4o-mini", max_tokens: 500, messages });
    let reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Replace product keywords with HTML cards
    reply = reply.replace(/\[FRAME\]/gi, productCard(PRODUCTS.frame));
    reply = reply.replace(/\[FLOWPRO\]/gi, productCard(PRODUCTS.flowpro));
    reply = reply.replace(/\[FLOWLITE\]/gi, productCard(PRODUCTS.flowlite));
    reply = reply.replace(/\[SYSTEM\]/gi, productCard(PRODUCTS.system));

    res.json({ reply });

  } catch (error) {
    console.error("OpenAI API error:", error?.message || error);
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
});

app.get("/", (req, res) => res.send("Relixa AI running 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

