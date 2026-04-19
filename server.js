import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================================
   ✅ PRODUCT DATABASE (FIXED)
================================ */

const PRODUCTS = {
  back: {
    name: "RELIXA FRAME™ – Upper Body Alignment System",
    keywords: ["back", "posture", "spine", "sitting", "ظهر", "وضعية"],
    url: "https://relixa-8727.myshopify.com/ar/products/relixa-frame%E2%84%A2-upper-body-alignment-system",
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/FRAME_posture_corrector_Sizes.png?v=1775145160",
    desc_en: "Corrects posture and relieves back pain.",
    desc_ar: "يساعد على تحسين وضعية الجسم وتخفيف آلام الظهر."
  },

  knee: {
    name: "RELIXA FLOW PRO™ – Dynamic Knee Stabilizer System",
    keywords: ["knee", "knees", "running", "ركبة"],
    url: "https://relixa-8727.myshopify.com/ar/collections/all", // ⚠️ replace with real product page when ready
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/337c693b-981e-458b-bdcb-1a29626d190c.jpg",
    desc_en: "Provides stability and reduces knee pain.",
    desc_ar: "يوفر دعمًا للركبة ويقلل الألم."
  },

  ankle: {
    name: "RELIXA FLOW LITE™ – Precision Ankle Stabilizer",
    keywords: ["ankle", "twisted", "sprain", "كاحل"],
    url: "https://relixa-8727.myshopify.com/ar/collections/all", // ⚠️ replace later
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/ca6bf736-e25c-497d-9dfb-a5410432267e.jpg",
    desc_en: "Supports the ankle and prevents injury.",
    desc_ar: "يدعم الكاحل ويمنع الإصابات."
  },

  system: {
    name: "RELIXA SYSTEM™ – Full Performance Support System",
    keywords: ["full", "all", "body", "everything", "كامل"],
    url: "https://relixa-8727.myshopify.com/ar",
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/RelixaSystem.png",
    desc_en: "Complete support for back, knee, and ankle.",
    desc_ar: "دعم كامل للظهر والركبة والكاحل."
  }
};

/* ================================
   ✅ HELPERS
================================ */

// Detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// Detect product
function detectProduct(message) {
  const text = message.toLowerCase();
  let matches = [];

  for (const key in PRODUCTS) {
    const product = PRODUCTS[key];

    if (product.keywords.some(k => text.includes(k))) {
      matches.push(key);
    }
  }

  if (matches.length >= 2) return PRODUCTS.system;
  if (matches.length === 1) return PRODUCTS[matches[0]];

  return null;
}

// Generate product card (clean reusable)
function generateCard(product, arabic) {
  return `
  <div style="${arabic ? "text-align:right;" : ""}">
    <p>${arabic ? "أنصحك بهذا المنتج 👇" : "I recommend this product 👇"}</p>

    <div style="border:1px solid #ddd; border-radius:12px; padding:12px;">
      <img src="${product.image}" style="width:100%; border-radius:10px;" />

      <h3>${product.name}</h3>

      <p>${arabic ? product.desc_ar : product.desc_en}</p>

      <a href="${product.url}?ref=chatbot" target="_blank"
        style="display:block; text-align:center; background:black; color:white; padding:10px; border-radius:8px; text-decoration:none;">
        ${arabic ? "عرض المنتج" : "View Product"}
      </a>
    </div>
  </div>
  `;
}

/* ================================
   ✅ MAIN API
================================ */

app.post("/api/chat", (req, res) => {
  try {
    const message = req.body.message || "";
    const arabic = isArabic(message);

    // Greeting
    if (/hello|hi|hey|مرحبا|سلام|اهلا/i.test(message)) {
      return res.json({
        reply: arabic
          ? "أهلاً 👋 كيف أقدر أساعدك اليوم؟"
          : "Hey 👋 How can I help you today?"
      });
    }

    const product = detectProduct(message);

    // No match
    if (!product) {
      return res.json({
        reply: arabic
          ? "وين الألم؟ (ظهر، ركبة، كاحل)"
          : "Where is the pain? (back, knee, ankle)"
      });
    }

    // Return product card
    return res.json({
      reply: generateCard(product, arabic)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error" });
  }
});

/* ================================
   ✅ HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("Relixa AI running 🚀");
});

/* ================================
   ✅ START SERVER
================================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
