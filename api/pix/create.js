// API Pix (FreePay) — cria a cobranca. Produto so no gateway (ESM)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const API_BASE = "https://api.freepaybrasil.com";
const PRODUCT_NAME = "Receita Bolo de Pote";
const STEPS = {
  checkout: { amount: 17.99, next: "../up1/" },
  up1: { amount: 27.74, next: "../up2/" },
  up2: { amount: 29.9, next: "../up3/" },
  up3: { amount: 29.9, next: "../up4/" },
  up4: { amount: 28.97, next: "../up5/" },
  up5: { amount: 37.9, next: "../obrigado/" },
};

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

/** CPF valido gerado internamente (o gateway exige o campo, mas nao pedimos ao cliente). */
function generateCpf() {
  const n = [];
  for (let i = 0; i < 9; i++) n.push(Math.floor(Math.random() * 10));
  for (let round = 0; round < 2; round++) {
    let sum = 0;
    const len = n.length + 1;
    for (let i = 0; i < n.length; i++) sum += n[i] * (len - i);
    const d = (sum * 10) % 11;
    n.push(d === 10 ? 0 : d);
  }
  return n.join("");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método inválido" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const config = STEPS[body.step];
  if (!config) return res.status(400).json({ error: "Etapa inválida" });

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  if (!name || email.indexOf("@") < 0) {
    return res.status(400).json({ error: "Informe nome e e-mail válidos." });
  }

  // O gateway exige o campo document. Nao pedimos ao cliente: se nao vier um CPF valido, geramos um.
  const informed = String(body.document || "").replace(/\D/g, "");
  const document = informed.length === 11 ? informed : generateCpf();
  const phone = String(body.phone || "").trim() || "+5511999999999";

  const cents = Math.round(config.amount * 100);
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = proto + "://" + req.headers.host;

  const payload = {
    amount: cents,
    payment_method: "pix",
    postback_url: origin + "/api/pix/webhook",
    customer: {
      name: name,
      email: email,
      document: { number: document, type: "cpf" },
      phone: phone,
    },
    items: [
      {
        title: PRODUCT_NAME,
        unit_price: cents,
        quantity: 1,
        tangible: false,
        external_ref: "receita-bolo-de-pote",
      },
    ],
    pix: { expires_in_days: 1 },
    metadata: { product: PRODUCT_NAME, step: body.step },
  };

  try {
    const r = await fetch(API_BASE + "/v1/payment-transaction/create", {
      method: "POST",
      headers: { authorization: auth(), "content-type": "application/json", accept: "application/json", "user-agent": UA },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("FreePay create failed", r.status, text.slice(0, 500));
      return res.status(502).json({ error: "Não foi possível gerar o Pix. Tente novamente." });
    }
    const tx = unwrap(JSON.parse(text));
    const pixRaw = Array.isArray(tx.pix) ? tx.pix[0] : tx.pix;
    const pix = pixRaw || {};
    if (!tx.id || !pix.qr_code) {
      console.error("FreePay sem pix", text.slice(0, 500));
      return res.status(502).json({ error: "O Pix não foi gerado. Tente novamente." });
    }
    return res.status(200).json({
      id: tx.id,
      amount: config.amount,
      qr_code: pix.qr_code,
      url: pix.url || "",
      next: config.next,
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Falha ao falar com o Pix. Tente novamente." });
  }
}
