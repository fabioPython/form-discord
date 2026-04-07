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
      headers["Access-Control-Allow-Methods"] = "POST";
      headers["Access-Control-Allow-Headers"] = "Content-Type";
    }


    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = await request.json();

      const { name, email, message } = data;

      // Basic validation
      if (!name || !email || !message) {
        return new Response("Missing fields", { status: 400 });
      }

      // Send to Discord webhook
      const webhookUrl = env.DISCORD_WEBHOOK_URL;

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📩 New form submission!\n\n**Name:** ${name}\n**Email:** ${email}\n**Message:** ${message}`
        })
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response("Server error", { status: 500 });
    }
  }
};
