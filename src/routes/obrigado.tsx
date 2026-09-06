import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";


export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Pagamento Concluído | TikTok Recompensas" },
      {
        name: "description",
        content: "Seu pagamento foi confirmado e o valor total será liberado na sua conta.",
      },
      { property: "og:title", content: "Pagamento Concluído | TikTok Recompensas" },
      { property: "og:description", content: "Liberação confirmada. Obrigado!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Obrigado,
});

function Obrigado() {
  useEffect(() => {
    trackEvent("Purchase", { content_name: "Obrigado", currency: "BRL", value: 3816.38 });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">

      <section className="w-full max-w-md rounded-2xl bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white">
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Tudo certo!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sua liberação foi confirmada. O valor total de{" "}
          <strong className="text-foreground">R$3.816,38</strong> será enviado para a conta
          cadastrada.
        </p>
      </section>
    </div>
  );
}
