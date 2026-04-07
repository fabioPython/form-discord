export default {
  async fetch(request, env) {
    const allowedOrigins = env.YOUR_DOMAIN.split(",");
    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Content-Type": "application/json",
    };

    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Methods"] = "POST, OPTIONS";
      corsHeaders["Access-Control-Allow-Headers"] = "Content-Type";
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      let data = {};

      const contentType = request.headers.get("Content-Type") || "";

      // ✅ Support JSON
      if (contentType.includes("application/json")) {
        data = await request.json();
      }
      // ✅ Support FormData (very useful)
      else if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      }
      // Fallback
      else {
        return new Response(
          JSON.stringify({ error: "Unsupported content type" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // ❗ Optional: reject empty submissions
      if (!data || Object.keys(data).length === 0) {
        return new Response(
          JSON.stringify({ error: "Empty form submission" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // ✅ Build dynamic Discord message
      const formatted = Object.entries(data)
        .map(([key, value]) => `**${key}:** ${value}`)
        .join("\n");

      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📩 New form submission!\n\n${formatted}`
        })
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: corsHeaders }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
