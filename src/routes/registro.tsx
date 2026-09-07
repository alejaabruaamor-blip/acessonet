import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/registro/index.html?raw";

export const Route = createFileRoute("/registro")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
