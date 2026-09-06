import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API_BASE = "https://api.freepaybrasil.com";

function authHeader() {
  const pub = process.env["FREEPAY_PUBLIC_KEY"];
  const sec = process.env["FREEPAY_SECRET_KEY"];
  if (!pub || !sec) throw new Error("Credenciais da FreePay não configuradas");
  return "Basic " + Buffer.from(`${pub}:${sec}`).toString("base64");
}

const createSchema = z.object({
  amount: z.number().positive().max(100000),
  title: z.string().min(1).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  document: z.string().min(11).max(20).optional(),
  phone: z.string().min(8).max(20).optional(),
});

function generateCpf() {
  const n: number[] = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digit = (base: number[]) => {
    const sum = base.reduce((acc, v, i) => acc + v * (base.length + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = digit(n);
  const d2 = digit([...n, d1]);
  return [...n, d1, d2].join("");
}

type PixInfo = { expiration_date?: string; qr_code?: string; url?: string; e2_e?: string };

function firstPix(payload: unknown): PixInfo | undefined {
  const data = (payload as { data?: unknown })?.data;
  const entry = Array.isArray(data) ? data[0] : data;
  const pix = (entry as { pix?: unknown })?.pix;
  return (Array.isArray(pix) ? pix[0] : pix) as PixInfo | undefined;
}

function firstEntry(payload: unknown) {
  const data = (payload as { data?: unknown })?.data;
  return (Array.isArray(data) ? data[0] : data) as
    | { id?: string; status?: string }
    | undefined;
}

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const cents = Math.round(data.amount * 100);
    const digits = data.document?.replace(/\D/g, "") || generateCpf();
    const phone = (data.phone?.replace(/\D/g, "") || "11999999999");

    const customer: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone,
      document: { number: digits, type: digits.length > 11 ? "cnpj" : "cpf" },
    };


    const res = await fetch(`${API_BASE}/v1/payment-transaction/create`, {
      method: "POST",
      headers: {
        authorization: authHeader(),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: cents,
        payment_method: "pix",
        customer,
        metadata: { provider_name: "Receita de Bolo de Pote" },
        items: [
          {
            title: "Receita de Bolo de Pote",
            unit_price: cents,
            quantity: 1,
            tangible: false,
          },
        ],
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Falha ao gerar o Pix (${res.status}): ${text.slice(0, 300)}`);
    }

    const payload = JSON.parse(text) as unknown;
    const pix = firstPix(payload);
    const entry = firstEntry(payload);

    if (!pix?.qr_code) throw new Error("A API não retornou o código Pix.");

    return {
      id: entry?.id ?? "",
      status: entry?.status ?? "PENDING",
      qrCode: pix.qr_code,
      qrCodeUrl: pix.url ?? null,
      expiresAt: pix.expiration_date ?? null,
    };
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(100) }).parse(data))
  .handler(async ({ data }) => {
    const res = await fetch(
      `${API_BASE}/v1/payment-transaction/info/${encodeURIComponent(data.id)}`,
      { headers: { authorization: authHeader() } },
    );
    if (!res.ok) return { status: "PENDING" as string };
    const payload = (await res.json()) as unknown;
    const entry = firstEntry(payload) ?? (payload as { status?: string });
    return { status: (entry as { status?: string })?.status ?? "PENDING" };
  });
