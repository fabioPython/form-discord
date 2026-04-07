export default {
  async fetch(request, env) {
    let allowedOrigins = env.YOUR_DOMAIN.split(',');
    //const allowedOrigins = ["https://yourdomain.com", "https://another-allowed.com"];
    const origin = request.headers.get("Origin");
    let headers = {
      "Content-Type": "text/plain",
    };

    // If request comes from an allowed origin, add CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
      headers["Access-Control-Allow-Headers"] = "Content-Type";
    }

    // Handle preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method === "POST" && new URL(request.url).pathname === "/send-form") {
      try {
        const body = await request.json();

        // Turn object into formatted text
        let message = "📩 New Form Submission:\n\n";
        for (const [key, value] of Object.entries(body)) {
          message += `🔹 ${key}: ${value}\n`;
        }

        const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        });

        return new Response("Form submitted successfully!", { headers });
      } catch (err) {
        return new Response("Error: " + err.message, { status: 500, headers });
      }
    }

    return new Response("Not found", { status: 404, headers });
  },
};
