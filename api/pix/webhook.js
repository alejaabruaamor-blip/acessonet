// API Pix (FreePay) — recebe a confirmacao de pagamento (ESM)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const id = body.Id || body.id;
  if (!id) return res.status(400).send("missing id");

  try {
    const r = await fetch(API_BASE + "/v1/payment-transaction/info/" + encodeURIComponent(id), {
      headers: { authorization: auth(), accept: "application/json", "user-agent": UA },
    });
    const tx = unwrap(await r.json());
    console.log("pix webhook", id, tx.status);
  } catch (e) {
    console.error(e);
  }
  return res.status(200).send("ok");
}
