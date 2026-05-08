import type { VercelRequest, VercelResponse } from "@vercel/node";

const updatedAt = "May 7, 2026";

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Taiwan Jobs Terms of Service</title>
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
      <h1>Taiwan Jobs Terms of Service</h1>
      <p>Last updated: ${updatedAt}</p>

      <p>Taiwan Jobs helps users search public job listings and company profiles from 104.com.tw through ChatGPT and MCP-compatible clients.</p>

      <h2>Use of the App</h2>
      <p>You may use the app to search and view public job and company information. You are responsible for how you use any information returned by the app.</p>

      <h2>No Employment or Recruiting Guarantee</h2>
      <p>The app is an informational search tool. It does not guarantee job availability, hiring outcomes, interview opportunities, application submission, salary accuracy, or employer responses.</p>

      <h2>Third-Party Content</h2>
      <p>Job and company data comes from 104.com.tw and may change, become unavailable, or contain errors. Follow the source links and the applicable 104.com.tw terms when relying on or using third-party content.</p>

      <h2>Prohibited Use</h2>
      <p>Do not use the app to violate law, abuse third-party services, scrape at unreasonable volume, submit false information, or interfere with the app, ChatGPT, Vercel, 104.com.tw, or related systems.</p>

      <h2>Disclaimer</h2>
      <p>The app is provided as-is without warranties of any kind. To the maximum extent permitted by law, the maintainers are not liable for indirect, incidental, consequential, or special damages arising from use of the app.</p>

      <h2>Contact</h2>
      <p>For support, open an issue at <a href="https://github.com/bigbrainw/104-mcp-server/issues">https://github.com/bigbrainw/104-mcp-server/issues</a>.</p>
    </main>
  </body>
</html>`);
}
