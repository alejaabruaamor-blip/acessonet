import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Páginas de Oferta em Português | TikTok Recompensas" },
      {
        name: "description",
        content: "Acesse as cinco páginas de oferta traduzidas para o português: upsell 1 a 5.",
      },
      { property: "og:title", content: "Páginas de Oferta em Português" },
      { property: "og:description", content: "Upsell 1 a 5 traduzidos para o português." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PAGES = [
  { to: "/checkout", title: "Checkout", desc: "Confirmação de pagamento → Upsell 1" },
  { to: "/upsell-1", title: "Upsell 1", desc: "Saque Solicitado" },
  { to: "/upsell-2", title: "Upsell 2", desc: "Verificando a segurança da transação" },
  { to: "/upsell-3", title: "Upsell 3", desc: "Bônus exclusivo liberado" },
  { to: "/upsell-4", title: "Upsell 4", desc: "Verificando dados" },
  { to: "/upsell-5", title: "Upsell 5", desc: "Bônus oculto encontrado" },
  { to: "/obrigado", title: "Obrigado", desc: "Página final após a liberação" },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <main className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Páginas em português</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          As cinco páginas foram traduzidas do inglês. Toque para abrir cada uma.
        </p>

        <ul className="mt-6 space-y-3">
          {PAGES.map((p) => (
            <li key={p.to}>
              <Link
                to={p.to}
                className="block rounded-xl bg-background p-4 shadow-sm transition-colors hover:bg-accent"
              >
                <span className="font-semibold text-foreground">{p.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{p.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
