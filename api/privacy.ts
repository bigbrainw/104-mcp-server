import type { VercelRequest, VercelResponse } from "@vercel/node";

const updatedAt = "May 7, 2026";

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Taiwan Jobs Privacy Policy</title>
    <style>
      body { color: #1f2937; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; }
      main { margin: 0 auto; max-width: 760px; padding: 48px 24px; }
      h1 { color: #111827; font-size: 2rem; line-height: 1.2; margin: 0 0 8px; }
      h2 { color: #111827; font-size: 1.2rem; margin-top: 32px; }
      p, li { font-size: 1rem; }
      a { color: #0f766e; }
    </style>
  </head>
  <body>
    <main>
      <h1>Taiwan Jobs Privacy Policy</h1>
      <p>Last updated: ${updatedAt}</p>

      <p>Taiwan Jobs is a ChatGPT app and MCP server for searching public job listings and company profiles from 104.com.tw.</p>

      <h2>Information We Process</h2>
      <p>The app processes the search terms, filters, job codes, and company codes that you provide in ChatGPT so it can return relevant job and company information. The hosted MCP server does not require a Taiwan Jobs account, does not ask for resumes, and does not intentionally collect sensitive personal information.</p>

      <h2>How Information Is Used</h2>
      <p>Inputs are used to query 104.com.tw and return public job listing and company profile data. We do not sell personal information, serve advertisements, or use app inputs for targeted advertising.</p>

      <h2>Third-Party Services</h2>
      <p>The app retrieves public information from 104.com.tw and is hosted on Vercel. Your use of ChatGPT is also governed by OpenAI's applicable terms and privacy policy.</p>

      <h2>Data Retention</h2>
      <p>The application does not maintain user accounts or a separate user database. Hosting, platform, and security logs may be retained by service providers for operational, debugging, abuse-prevention, and security purposes.</p>

      <h2>Contact</h2>
      <p>For support or privacy questions, open an issue at <a href="https://github.com/bigbrainw/104-mcp-server/issues">https://github.com/bigbrainw/104-mcp-server/issues</a>.</p>
    </main>
  </body>
</html>`);
}
