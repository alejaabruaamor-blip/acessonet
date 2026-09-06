import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { PixCheckoutModal } from "@/components/PixCheckoutModal";

export const Route = createFileRoute("/upsell-3")({
  head: () => ({
    meta: [
      { title: "Bônus Exclusivo Liberado | TikTok Recompensas" },
      {
        name: "description",
        content: "Você desbloqueou um bônus exclusivo de R$1.700,00 no seu saldo do TikTok.",
      },
      { property: "og:title", content: "Bônus Exclusivo Liberado | TikTok Recompensas" },
      { property: "og:description", content: "Novo saldo de R$2.568,75 disponível para saque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upsell3,
});

function TikTokLogo() {
  return (
    <header className="flex h-14 items-center justify-center border-b border-border bg-background">
      <span className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-foreground">
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.79-2.46V9.8a5.79 5.79 0 1 0 4.88 5.72V9.01a7.35 7.35 0 0 0 4.29 1.38V7.3a4.29 4.29 0 0 1-3.23-1.48Z"
          />
        </svg>
        TikTok
      </span>
    </header>
  );
}

function Upsell3() {
  const [left, setLeft] = useState(600);
  const [spots] = useState(() => 11 + Math.floor(Math.random() * 3));
  const [pixOpen, setPixOpen] = useState(false);

  useEffect(() => {
    trackEvent("ViewContent", { content_name: "Upsell 3", currency: "BRL", value: 29.9 });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const time = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <TikTokLogo />

      <div className="flex items-center justify-center gap-2 bg-[#fe2c55] py-3 text-sm font-extrabold uppercase tracking-wide text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
        Bônus exclusivo liberado
      </div>

      <main className="mx-auto w-full max-w-md px-4 py-6">
        <section className="rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50 to-background p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <circle cx="15" cy="15" r="6" />
            </svg>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Seu novo saldo
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-foreground">R$2.568,75</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground line-through">R$868,75</span>
            <span className="font-bold text-emerald-600">↗ +R$1.700,00</span>
          </p>
        </section>

        <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-3 text-center text-sm font-bold text-rose-600">
          🔥 Restam apenas {spots} vagas para este bônus
        </p>

        <section className="mt-4 rounded-2xl bg-muted/60 p-4">
          <div className="rounded-xl border border-border bg-background p-5 text-center">
            <p className="text-sm text-muted-foreground">Taxa única de ativação:</p>
            <p className="mt-1 text-3xl font-extrabold text-[#fe2c55]">R$29,90</p>
          </div>

          <button
            type="button"
            onClick={() => {
              trackEvent("AddToCart", { content_name: "Upsell 3", currency: "BRL", value: 29.9 });
              setPixOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe2c55] px-4 py-4 text-base font-extrabold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Garantir meus R$2.568,75 agora
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Oferta válida por: <span className="font-bold text-[#fe2c55]">{time}</span>
          </p>
        </section>
      </main>

      <PixCheckoutModal
        open={pixOpen}
        onClose={() => setPixOpen(false)}
        amount={29.9}
        title="Ativação do Bônus"
        nextRoute="/upsell-4"
        prefillName="Cliente"
        prefillEmail={`cliente+up3${Date.now()}@email.com`}
      />
    </div>
  );
}
