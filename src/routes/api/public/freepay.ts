import { createFileRoute } from "@tanstack/react-router";

/**
 * Recebe os webhooks da FreePay (venda gerada / pendente e venda aprovada)
 * e repassa para a UTMify usando o token guardado no servidor.
 */

type AnyRec = Record<string, unknown>;

const get = (obj: AnyRec, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => (acc as AnyRec)?.[k], obj);

const pick = (obj: AnyRec, paths: string[]): string | undefined => {
  for (const p of paths) {
    const v = get(obj, p);
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
};

const pickNum = (obj: AnyRec, paths: string[]): number | undefined => {
  for (const p of paths) {
    const v = get(obj, p);
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
};

const nowUtc = () => new Date().toISOString().replace("T", " ").slice(0, 19);

function mapStatus(raw?: string): "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback" {
  const s = (raw ?? "").toLowerCase();
  if (["paid", "approved", "aprovado", "aprovada", "completed", "pago"].some((k) => s.includes(k)))
    return "paid";
  if (["refund", "estorn", "reembols"].some((k) => s.includes(k))) return "refunded";
  if (["chargeback", "charged_back"].some((k) => s.includes(k))) return "chargedback";
  if (["refus", "cancel", "recus", "fail", "expired"].some((k) => s.includes(k))) return "refused";
  return "waiting_payment";
}

export const Route = createFileRoute("/api/public/freepay")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true, endpoint: "freepay->utmify" }),
      POST: async ({ request }) => {
        const token = process.env["UTMIFY_API_TOKEN"];
        if (!token) return Response.json({ error: "UTMIFY_API_TOKEN ausente" }, { status: 500 });

        let payload: AnyRec;
        try {
          payload = (await request.json()) as AnyRec;
        } catch {
          return Response.json({ error: "JSON invalido" }, { status: 400 });
        }

        const statusRaw = pick(payload, [
          "status",
          "data.status",
          "payment_status",
          "transaction.status",
          "event",
          "type",
        ]);
        const status = mapStatus(statusRaw);

        const orderId =
          pick(payload, [
            "id",
            "transaction_id",
            "data.id",
            "order_id",
            "transaction.id",
            "reference",
          ]) ?? `freepay-${Date.now()}`;

        let amount =
          pickNum(payload, [
            "amount",
            "data.amount",
            "total",
            "value",
            "transaction.amount",
            "paid_amount",
          ]) ?? 0;
        // A FreePay envia em centavos na maioria dos eventos.
        if (amount > 0 && Number.isInteger(amount) && amount >= 1000) {
          // já está em centavos
        } else {
          amount = Math.round(amount * 100);
        }

        const createdAt = pick(payload, ["created_at", "data.created_at"]) ?? nowUtc();
        const approvedDate = status === "paid" ? nowUtc() : null;

        const body = {
          orderId,
          platform: "FreePay",
          paymentMethod: (pick(payload, ["payment_method", "data.payment_method", "method"]) ??
            "pix") as string,
          status,
          createdAt: createdAt.replace("T", " ").slice(0, 19),
          approvedDate,
          refundedAt: null,
          customer: {
            name: pick(payload, ["customer.name", "data.customer.name", "client.name"]) ?? "Cliente",
            email:
              pick(payload, ["customer.email", "data.customer.email", "client.email"]) ??
              "sememail@cliente.com",
            phone: pick(payload, ["customer.phone", "data.customer.phone"]) ?? null,
            document: pick(payload, ["customer.document.number", "customer.document"]) ?? null,
            country: "BR",
            ip: pick(payload, ["customer.ip", "data.customer.ip"]) ?? null,
          },
          products: [
            {
              id: pick(payload, ["items.0.id", "data.items.0.id"]) ?? "produto-1",
              name: pick(payload, ["items.0.title", "data.items.0.title", "product_name"]) ?? "Produto",
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: amount,
            },
          ],
          trackingParameters: {
            src: pick(payload, ["src", "tracking.src"]) ?? null,
            sck: pick(payload, ["sck", "tracking.sck"]) ?? null,
            utm_source: pick(payload, ["utm_source", "tracking.utm_source"]) ?? null,
            utm_medium: pick(payload, ["utm_medium", "tracking.utm_medium"]) ?? null,
            utm_campaign: pick(payload, ["utm_campaign", "tracking.utm_campaign"]) ?? null,
            utm_content: pick(payload, ["utm_content", "tracking.utm_content"]) ?? null,
            utm_term: pick(payload, ["utm_term", "tracking.utm_term"]) ?? null,
          },
          commission: {
            totalPriceInCents: amount,
            gatewayFeeInCents: 0,
            userCommissionInCents: amount,
          },
          isTest: false,
        };

        const res = await fetch("https://api.utmify.com.br/api-credentials/orders", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-token": token },
          body: JSON.stringify(body),
        });
        const text = await res.text();

        return Response.json(
          { forwarded: res.ok, utmify_status: res.status, utmify_response: text.slice(0, 500) },
          { status: res.ok ? 200 : 502 },
        );
      },
    },
  },
});
