import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/__frontend/ready") {
      const token = process.env.FRONTEND_WORKER_TOKEN;
      return token
        ? Response.json(
            { token, pid: process.pid },
            { headers: { "Cache-Control": "no-store" } },
          )
        : new Response("Not found", { status: 404 });
    }
    const origin = process.env.PUBLIC_ORIGIN;
    if (origin) {
      const publicUrl = new URL(origin);
      publicUrl.pathname = url.pathname;
      publicUrl.search = url.search;
      request = new Request(publicUrl, request);
    }
    return handler.fetch(request);
  },
});
