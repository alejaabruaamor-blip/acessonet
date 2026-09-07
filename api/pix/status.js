// API Pix (FreePay) — consulta o status da cobranca
const API_BASE = "https://api.freepaybrasil.com";

function auth() {
  const pub = process.env.FREEPAY_PUBLIC_KEY || "";
  const secret = process.env.FREEPAY_SECRET_KEY || "";
  return "Basic " + Buffer.from(pub + ":" + secret).toString("base64");
}

function unwrap(payload) {
  if (!payload) return {};
  const data = payload.data || payload;
  return Array.isArray(data) ? data[0] || {} : data;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  const id = (req.query && req.query.id) || "";
  if (!id) return res.status(400).json({ error: "Cobrança não informada" });

  try {
    const r = await fetch(API_BASE + "/v1/payment-transaction/info/" + encodeURIComponent(id), {
      headers: { authorization: auth(), accept: "application/json" },
    });
    if (!r.ok) return res.status(200).json({ status: "PENDING", paid: false });
    const tx = unwrap(await r.json());
    const status = String(tx.status || "PENDING").toUpperCase();
    return res.status(200).json({ status: status, paid: status === "PAID" });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ status: "PENDING", paid: false });
  }
};
