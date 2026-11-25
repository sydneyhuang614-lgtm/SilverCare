/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  LINE_CHANNEL_ACCESS_TOKEN?: string;
  LINE_RECIPIENT_USER_ID?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/line/notify" && request.method === "POST") {
      const origin = request.headers.get("Origin");
      if (origin !== url.origin) return Response.json({ ok: false }, { status: 403 });
      if (!env.LINE_CHANNEL_ACCESS_TOKEN || !env.LINE_RECIPIENT_USER_ID) {
        return Response.json({ ok: false, reason: "not_configured" }, { status: 503 });
      }
      let payload: { type?: string; detail?: string };
      try { payload = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
      const detail = typeof payload.detail === "string" ? payload.detail.slice(0, 80) : "";
      const message = payload.type === "safe"
        ? "暖日通知：媽媽今天已回報平安，請放心。"
        : payload.type === "help" && detail
          ? `暖日關懷通知：媽媽表示「${detail}」，請盡快關心她。`
          : "";
      if (!message) return Response.json({ ok: false }, { status: 400 });
      const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: env.LINE_RECIPIENT_USER_ID, messages: [{ type: "text", text: message }] }),
      });
      return Response.json({ ok: lineResponse.ok }, { status: lineResponse.ok ? 200 : 502 });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

