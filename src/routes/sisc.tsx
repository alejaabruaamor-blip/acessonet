import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/sisc/index.html?raw";

export const Route = createFileRoute("/sisc")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
