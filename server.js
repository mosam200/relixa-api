import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PRODUCTS (ADD MORE HERE ANYTIME)
const PRODUCTS = [
  {
    name: "Posture Corrector",
    keywords: ["posture", "back", "pain", "corrector", "ظهر", "وضعية"],
    url: "https://relixa-827.myshopify.com/products/posture-corrector",
    image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/Relixa_Logo_white.png?v=1775988711",
    desc_en: "Improves posture and reduces back pain.",
    desc_ar: "يساعد على تحسين وضعية الجسم وتخفيف آلام الظهر."
  }
];

// ✅ Detect Arabic
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// ✅ Find matching product
function findProduct(message) {
  const lower = message.toLowerCase();

  for (let product of PRODUCTS) {
    if (product.keywords.some(k => lower.includes(k))) {
      return product;
    }
  }

  // default product
  return PRODUCTS[0];
}

app.post("/api/chat", async (req, res) => {
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

    // ✅ Product recommendation
    else {
      const product = findProduct(message);

      if (arabic) {
        reply = `
<div style="text-align:right;">
  <p>أنصحك بهذا المنتج 👇</p>

  <div style="border:1px solid #ddd; border-radius:12px; padding:12px;">
    <img src="${product.image}" style="width:100%; border-radius:10px;" />

    <h3 style="margin:10px 0;">${product.name}</h3>

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

    <h3 style="margin:10px 0;">${product.name}</h3>

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
