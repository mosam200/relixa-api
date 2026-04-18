import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FULL PRODUCT DATABASE
const PRODUCTS = {
  back: {
    name: "RELIXA FRAME™ – Upper Body Alignment System",
    keywords: ["back", "posture", "spine", "sitting", "ظهر", "وضعية"],
    url: "https://relixa-8727.myshopify.com/products/relixa-frame™-upper-body-alignment-system",
    image: "PASTE_BACK_IMAGE_HERE",
    desc_en: "Corrects posture and relieves back pain.",
    desc_ar: "يساعد على تحسين وضعية الجسم وتخفيف آلام الظهر."
  },

  knee: {
    name: "RELIXA FLOW PRO™ – Dynamic Knee Stabilizer System",
    keywords: ["knee", "knees", "running", "ركبة"],
    url: "https://relixa-8727.myshopify.com/cdn/shop/files/337c693b-981e-458b-bdcb-1a29626d190c.jpg?v=1774092270&width=990",
    image: "PASTE_KNEE_IMAGE_HERE",
    desc_en: "Provides stability and reduces knee pain.",
    desc_ar: "يوفر دعمًا للركبة ويقلل الألم."
  },

  ankle: {
    name: "RELIXA FLOW LITE™ – Precision Ankle Stabilizer",
    keywords: ["ankle", "twisted", "sprain", "كاحل"],
    url: "https://relixa-8727.myshopify.com/products/relixa-flow-lite™-precision-ankle-stabilizer",
    image: "PASTE_ANKLE_IMAGE_HERE",
    desc_en: "Supports the ankle and prevents injury.",
    desc_ar: "يدعم الكاحل ويمنع الإصابات."
  },

  system: {
    name: "RELIXA SYSTEM™ – Full Performance Support System",
    keywords: ["full", "all", "body", "everything", "كامل"],
    url: "https://relixa-8727.myshopify.com/products/relixa-system",
    image: "PASTE_SYSTEM_IMAGE_HERE",
    desc_en: "Complete support for back, knee, and ankle.",
    desc_ar: "دعم كامل للظهر والركبة والكاحل."
  }
};

// ✅ Detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// ✅ SMART DETECTION (FIXED)
function detectProduct(message) {
  const text = message.toLowerCase();

  let matches = [];

  for (const key in PRODUCTS) {
    const product = PRODUCTS[key];

    if (product.keywords.some(k => text.includes(k))) {
      matches.push(key);
    }
  }

  // 🔥 MULTIPLE MATCH → FULL SYSTEM
  if (matches.length >= 2) {
    return PRODUCTS.system;
  }

  // 🔥 SINGLE MATCH
  if (matches.length === 1) {
    return PRODUCTS[matches[0]];
  }

  // ❌ NO MATCH → NULL (no more wrong product!)
  return null;
}

app.post("/api/chat", (req, res) => {
  try {
    const message = req.body.message || "";
    const arabic = isArabic(message);

    let reply;

    // ✅ Greeting
    if (/hello|hi|hey|مرحبا|سلام|اهلا/i.test(message)) {
      reply = arabic
        ? `أهلاً 👋 كيف أقدر أساعدك اليوم؟`
        : `Hey 👋 How can I help you today?`;
    }

    // ✅ Product logic
    else {
      const product = detectProduct(message);

      // ❌ No match → ask user
      if (!product) {
        return res.json({
          reply: arabic
            ? "وين الألم؟ (ظهر، ركبة، كاحل)"
            : "Where is the pain? (back, knee, ankle)"
        });
      }

      if (arabic) {
        reply = `
<div style="text-align:right;">
  <p>أنصحك بهذا المنتج 👇</p>

  <div style="border:1px solid #ddd; border-radius:12px; padding:12px;">
    <img src="${product.image}" style="width:100%; border-radius:10px;" />

    <h3>${product.name}</h3>

    <p>${product.desc_ar}</p>

    <a href="${product.url}" target="_blank"
      style="display:block; text-align:center; background:black; color:white; padding:10px; border-radius:8px; text-decoration:none;">
      عرض المنتج
    </a>
  </div>
</div>
`;
      } else {
        reply = `
<div>
  <p>I recommend this product 👇</p>

  <div style="border:1px solid #ddd; border-radius:12px; padding:12px;">
    <img src="${product.image}" style="width:100%; border-radius:10px;" />

    <h3>${product.name}</h3>

    <p>${product.desc_en}</p>

    <a href="${product.url}" target="_blank"
      style="display:block; text-align:center; background:black; color:white; padding:10px; border-radius:8px; text-decoration:none;">
      View Product
    </a>
  </div>
</div>
`;
      }
    }

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error" });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Relixa AI running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
