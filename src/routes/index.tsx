import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/junin1" });
  },
  head: () => ({
    meta: [
      { title: "Pagamento Seguro | Receita de Bolo de Pote" },
      {
        name: "description",
        content: "Finalize seu pagamento por Pix em poucos segundos e libere o acesso imediato.",
      },
      { property: "og:title", content: "Pagamento Seguro | Receita de Bolo de Pote" },
      {
        property: "og:description",
        content: "Finalize seu pagamento por Pix em poucos segundos e libere o acesso imediato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
