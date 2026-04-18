export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const text = message.toLowerCase();

  // 🧠 PRODUCTS
  const products = {
    back: {
      name: "RELIXA FRAME™ – Upper Body Alignment System",
      desc: "Corrects posture and relieves back pain.",
      url: "https://relixa-8727.myshopify.com/products/relixa-frame™-upper-body-alignment-system",
      image: "REPLACE_WITH_REAL_BACK_IMAGE"
    },
    knee: {
      name: "RELIXA FLOW PRO™ – Dynamic Knee Stabilizer System",
      desc: "Stabilizes knees and reduces pain.",
      url: "https://relixa-8727.myshopify.com/products/relixa-flow-pro™-dynamic-knee-stabilizer-system",
      image: "REPLACE_WITH_REAL_KNEE_IMAGE"
    },
    ankle: {
      name: "RELIXA FLOW LITE™ – Precision Ankle Stabilizer",
      desc: "Supports ankles and prevents injury.",
      url: "https://relixa-8727.myshopify.com/products/relixa-flow-lite™-precision-ankle-stabilizer",
      image: "REPLACE_WITH_REAL_ANKLE_IMAGE"
    },
    system: {
      name: "RELIXA SYSTEM™ – Full Performance Support System",
      desc: "Complete support for back, knee, and ankle.",
      url: "https://relixa-8727.myshopify.com/products/relixa-system",
      image: "REPLACE_WITH_REAL_SYSTEM_IMAGE"
    }
  };

  // 🔍 DETECT BODY PARTS
  const hasBack = ["back", "posture", "spine", "sitting"].some(k => text.includes(k));
  const hasKnee = ["knee", "running"].some(k => text.includes(k));
  const hasAnkle = ["ankle", "twisted", "sprain"].some(k => text.includes(k));

  let selected = null;

  // 🧠 SMART PRIORITY LOGIC
  const count = [hasBack, hasKnee, hasAnkle].filter(Boolean).length;

  if (count >= 2 || text.includes("whole body") || text.includes("everything")) {
    selected = products.system;
  } else if (hasKnee) {
    selected = products.knee;
  } else if (hasAnkle) {
    selected = products.ankle;
  } else if (hasBack) {
    selected = products.back;
  }

  // 🎯 FALLBACK
  if (!selected) {
    return res.status(200).json({
      reply: `
        <div>
          <p>I couldn't find an exact match 🤔</p>
          <p>Please tell me where the pain is:</p>
          <ul>
            <li>Back</li>
            <li>Knee</li>
            <li>Ankle</li>
            <li>Multiple areas</li>
          </ul>
        </div>
      `
    });
  }

  // 🎨 HTML
  const html = `
    <div>
      <p>I recommend this product 👇</p>
      <div style="border:1px solid #ddd; border-radius:12px; padding:12px;">
        <img src="${selected.image}" style="width:100%; border-radius:10px;" />
        <h3>${selected.name}</h3>
        <p>${selected.desc}</p>
        <a href="${selected.url}" target="_blank"
           style="display:block; text-align:center; background:black; color:white; padding:10px; border-radius:8px; text-decoration:none;">
          View Product
        </a>
      </div>
    </div>
  `;

  return res.status(200).json({ reply: html });
}
