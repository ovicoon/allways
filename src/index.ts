export interface Env {
  GEMINI_WORKER_URL: string;
  MY_SECRET_KEY: string;
}

interface GeminiResponse {
  completion?: string;
  model?: string;
  usage?: unknown;
  error?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed. Use POST." },
        { status: 405 }
      );
    }

    try {
      const body = await request.json() as {
        prompt?: string;
        system?: string;
        model?: string;
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
      };

      if (!body.prompt) {
        return Response.json(
          { error: "Missing required field: prompt" },
          { status: 400 }
        );
      }

      const upstreamUrl =
        `${env.GEMINI_WORKER_URL.replace(/\/+$/, "")}/api/gemini`;

      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": env.MY_SECRET_KEY,
        },
        body: JSON.stringify({
          prompt: body.prompt,
          system: body.system ?? "You are a helpful assistant.",
          model: body.model ?? "gemini-2.5-flash",
          temperature: body.temperature,
          top_p: body.top_p,
          max_tokens: body.max_tokens,
        }),
      });

      const result = await upstreamResponse.json().catch(() => ({
        error: "Invalid JSON response from upstream Worker",
      })) as GeminiResponse;

      return Response.json(result, {
        status: upstreamResponse.status,
      });
    } catch (error) {
      console.error("Gemini Worker request failed:", error);

      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
};