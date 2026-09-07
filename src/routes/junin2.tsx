import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/junin2/index.html?raw";

export const Route = createFileRoute("/junin2")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
