import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Cloud Run / most PaaS providers inject PORT. Default to 3000 for local dev.
  const PORT = parseInt(process.env.PORT || "3000", 10);

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  // Trust the Cloud Run / load-balancer proxy so req.protocol and req.get("host")
  // reflect the original https URL the client used (needed for OAuth redirect URIs).
  app.set("trust proxy", true);

  app.use(cors());
  app.use(express.json());

  // Use a more relaxed helmet config for dev/iframe compatibility
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Helper: build the public-facing base URL of this service.
  // In production prefer the explicit APP_URL env var (set on Cloud Run), and
  // fall back to inferring from the request. In dev, use the request host.
  const getBaseUrl = (req: express.Request): string => {
    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    return `${proto}://${req.get("host")}`;
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Notification Endpoint
  app.post("/api/notify", async (req, res) => {
    const { to, type, fromUser, postContent } = req.body;

    if (!resend) {
      console.log("Resend API key missing. Notification log:", { to, type, fromUser });
      return res.status(200).json({ success: true, message: "Logged (No API Key)" });
    }

    try {
      const subject = type === "comment" ? `New comment on your post from ${fromUser}` : `New reaction on your post from ${fromUser}`;
      const text = type === "comment"
        ? `${fromUser} commented on your post: "${postContent}"`
        : `${fromUser} reacted to your post: "${postContent}"`;

      await resend.emails.send({
        from: "Terminal Connect <notifications@resend.dev>",
        to: [to],
        subject: subject,
        text: text,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Extract metadata from URL
  app.post("/api/metadata", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 5000,
      });

      const $ = cheerio.load(response.data);

      const metadata = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text() || url,
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
        source: new URL(url).hostname,
        url: url
      };

      res.json(metadata);
    } catch (error) {
      console.error("Error extracting metadata:", error);
      res.status(500).json({ error: "Failed to extract metadata from URL" });
    }
  });

  // Job Application Endpoint
  app.post("/api/job-apply", async (req, res) => {
    const { jobTitle, companyName, applicantName, applicantEmail, creatorEmail, message } = req.body;

    if (!resend) {
      console.log("Resend API key missing. Application log:", { jobTitle, companyName, applicantName, applicantEmail, creatorEmail, message });
      return res.status(200).json({ success: true, message: "Logged (No API Key)" });
    }

    try {
      await resend.emails.send({
         from: "Tankonomics Jobs <jobs@resend.dev>",
         to: [creatorEmail],
         subject: `New Application for ${jobTitle} at ${companyName}`,
         text: `${applicantName} (${applicantEmail}) has applied for the ${jobTitle} position at ${companyName}.

${message ? `Applicant Message:\n"${message}"\n` : ""}
Please reach out to them directly via their email: ${applicantEmail}`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending application email:", error);
      res.status(500).json({ error: "Failed to send application" });
    }
  });

  // LinkedIn OAuth
  app.get("/api/auth/linkedin/url", (req, res) => {
    const redirectUri = `${getBaseUrl(req)}/api/auth/linkedin/callback`;

    // Using openid scopes for profile info. Note: job title and company often require additional permissions
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID || "",
      redirect_uri: redirectUri,
      scope: "openid profile email", // Basic scopes
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(["/api/auth/linkedin/callback", "/api/auth/linkedin/callback/"], async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: "OAUTH_AUTH_ERROR", error: "${error_description || error}" }, "*");
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("Code missing");
    }

    try {
      const redirectUri = `${getBaseUrl(req)}/api/auth/linkedin/callback`;

      // 1. Exchange code for access token
      const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        client_id: process.env.LINKEDIN_CLIENT_ID || "",
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const accessToken = tokenResponse.data.access_token;

      // 2. Fetch User Info (OpenID Connect)
      const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const userData = userResponse.data;

      // Note: In a production app with full permissions, you would fetch positions and skills here.
      // For this demo, we'll return the profile data we have.
      const profile = {
        name: userData.name,
        firstName: userData.given_name,
        lastName: userData.family_name,
        email: userData.email,
        picture: userData.picture,
        linkedinId: userData.sub,
        // Placeholders for restricted data if not available in basic profile
        jobTitle: "Imported from LinkedIn",
        company: "Imported from LinkedIn",
        skills: []
      };

      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: "OAUTH_AUTH_SUCCESS",
                payload: ${JSON.stringify(profile)}
              }, "*");
              window.close();
            </script>
            <p>Import successful! Closing window...</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("LinkedIn OAuth Error:", err.response?.data || err.message);
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: "OAUTH_AUTH_ERROR", error: "Failed to exchange token or fetch profile" }, "*");
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  });

  // Vite middleware for development; static-serve the built bundle in production.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
