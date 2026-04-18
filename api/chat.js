export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const text = message.toLowerCase();

  // 🧠 PRODUCT DATABASE
  const products = {
    back: {
      name: "Posture Corrector",
      desc: "Improves posture and reduces back pain.",
      url: "https://relixa-827.myshopify.com/products/posture-corrector",
      image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/Relixa_Logo_white.png"
    },
    knee: {
      name: "Knee Support",
      desc: "Provides stability and reduces knee pain.",
      url: "#",
      image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/Relixa_Logo_white.png"
    },
    ankle: {
      name: "Ankle Support",
      desc: "Supports the ankle and prevents injury.",
      url: "#",
      image: "https://cdn.shopify.com/s/files/1/0600/0495/8337/files/Relixa_Logo_white.png"
    }
  };

  // 🔍 KEYWORD MAP (more scalable + avoids logic bugs)
  const keywordMap = [
    {
      type: "knee",
      keywords: ["knee", "knees", "running", "runner"]
    },
    {
      type: "ankle",
      keywords: ["ankle", "twist", "twisted", "sprain"]
    },
    {
      type: "back",
      keywords: ["back", "posture", "spine", "sitting"]
    }
  ];

  let selected = null;

  // 🔎 DETECTION LOOP (clean + extendable)
  for (const group of keywordMap) {
    if (group.keywords.some(keyword => text.includes(keyword))) {
      selected = products[group.type];
      break;
    }
  }

  // 🎯 FALLBACK (no wrong product anymore)
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
          </ul>
        </div>
      `
    });
  }

  // 🎨 HTML RESPONSE
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
