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
    name: "RELIXA FRAME™ – Upper Body Alignment System",
    url: "https://relixa-8727.myshopify.com/products/relixa-frame%E2%84%A2-upper-body-alignment-system",
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/FRAME_posture_corrector_Sizes.png?v=1775145160"
  }
};

function productCard(product) {
  return `<div style="margin-top:8px;border:1px solid #eee;border-radius:10px;overflow:hidden;max-width:280px;">
<a href="${product.url}" target="_blank" style="text-decoration:none;color:inherit;">
<img src="${product.image}" style="width:100%;display:block;" />
</a>
<div style="padding:10px;">
<b style="font-size:14px;">${product.name}</b><br/>
<span style="font-size:13px;color:#555;">19 BHD</span><br/>
<a href="${product.url}" target="_blank" style="display:inline-block;margin-top:8px;background:#000;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:bold;">View Product →</a>
</div></div>`;
}

const SYSTEM_PROMPT = `You are Relixa's AI support agent for a premium GCC health and wellness brand.

Relixa currently offers one product:
- RELIXA FRAME™: Upper body posture corrector and alignment system. Designed for desk workers, office professionals, students, and anyone experiencing upper back pain, neck strain, or poor posture from prolonged sitting. Price: 19 BHD (on sale from 29 BHD). keyword: [FRAME]

Product page link: https://relixa-8727.myshopify.com/products/relixa-frame%E2%84%A2-upper-body-alignment-system

Sizing guide:
- S-M: Bust 27–37 inches, Height 59–67 inches, Weight 110–170 lbs
- L-XL: Bust 37–47 inches, Height 67–75 inches, Weight 170–220 lbs
- If between sizes: recommend S-M for tighter support, L-XL for more comfort

Shipping & orders:
- Free shipping across GCC (Bahrain, Saudi Arabia, UAE, Kuwait, Qatar)
- Delivery: 7–12 business days with full tracking
- Payment: Visa, Mastercard, Apple Pay, Benefit, Mada
- Returns: 30-day risk-free — full refund if not satisfied

Rules:
- Respond in the same language the customer uses (Arabic or English)
- Be warm, confident, and concise — max 2–3 sentences
- Always recommend [FRAME] when a customer mentions back pain, posture, neck pain, shoulder pain, or sitting too long
- When a user asks to see the product, buy it, or asks for the product page/link, ALWAYS provide the direct link: https://relixa-8727.myshopify.com/products/relixa-frame%E2%84%A2-upper-body-alignment-system and include [FRAME]
- If asked about other products (knee, ankle, bundles), say: "We're currently focused on the FRAME™ system. More products are coming soon — stay tuned!"
- Never make up information
- Never mention FLOW PRO, FLOW LITE, RELIXA SYSTEM, or any discontinued products`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, agent, history = [] } = req.body;
    if (!message) return res.status(400).json({ reply: "No message provided." });

    let systemPrompt = SYSTEM_PROMPT;
    if (agent === "sales") systemPrompt += "\n\nYou are the SALES agent. Be persuasive, highlight the 19 BHD sale price (was 29 BHD), and handle objections confidently. Always recommend [FRAME] and provide the product link when asked.";
    else if (agent === "content") systemPrompt += "\n\nYou are the CONTENT agent. Generate TikTok scripts, ad hooks, and product descriptions for FRAME™. Give 2 variations. Focus on posture, back pain, desk workers.";
    else if (agent === "analytics") systemPrompt += "\n\nYou are the ANALYTICS agent. Interpret sales data, ROAS, AOV, and conversion rates. Be practical and data-driven.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({ model: "gpt-4o-mini", max_tokens: 500, messages });
    let reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Replace product keyword with HTML card
    reply = reply.replace(/\[FRAME\]/gi, productCard(PRODUCTS.frame));

    res.json({ reply });

  } catch (error) {
    console.error("OpenAI API error:", error?.message || error);
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
});

app.get("/", (req, res) => res.send("Relixa AI running 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
