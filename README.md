# 104.com.tw MCP Server

MCP server for Taiwan's largest job platform — search jobs, browse companies, and apply, all from Claude.

> **Disclaimer:** This project is not affiliated with or endorsed by 104 Human Resources Group (104人力銀行). Use in accordance with [104.com.tw's Terms of Service](https://www.104.com.tw/about/terms.html).

## Tools

| Tool | Auth required | Description |
|---|---|---|
| `search_jobs` | No | Search job listings by keyword, location, salary, remote, etc. |
| `get_job_detail` | No | Full job posting: description, salary, requirements, welfare |
| `search_companies` | No | Search companies by name |
| `get_company_detail` | No | Company profile + optional current job listings |
| `login` | — | Log in with email/password |
| `logout` | — | Log out |
| `apply_job` | Yes | Apply to a job with optional cover letter |
| `save_job` | Yes | Bookmark a job |
| `save_company` | Yes | Follow a company |

## Setup

### Via npx (recommended)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "104": {
      "command": "npx",
      "args": ["-y", "104-mcp-server"]
    }
  }
}
```

### Manual

```bash
npm install
npm run build
```

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "104": {
      "command": "node",
      "args": ["/path/to/104-mcp/dist/index.js"]
    }
  }
}
```

## Usage examples

- "Search for backend engineer jobs in Taipei with remote work"
- "Show me the details for job 8tft1"
- "Search for companies named Google in Taiwan"
- "Get the company profile for 1a2x6bmutz including their job openings"
- "Login with my 104 account and apply to job 8kq2g"

## Location codes

| Code | Area |
|---|---|
| `6001001000` | 台北市 |
| `6001002000` | 新北市 |
| `6001003000` | 桃園市 |
| `6001005000` | 台中市 |
| `6001006000` | 台南市 |
| `6001008000` | 高雄市 |

## Compatible clients

Works with any MCP-compatible AI client:

| Client | Config file |
|---|---|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Cursor | `~/.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| Cline (VS Code) | MCP Servers panel in sidebar |
| Continue.dev | `~/.continue/config.json` → `mcpServers` |
| Zed | `settings.json` → `context_servers` |

All clients use the same config block:

```json
{
  "mcpServers": {
    "104": {
      "command": "npx",
      "args": ["-y", "104-mcp-server"]
    }
  }
}
```

## ChatGPT / GPT Actions

A REST API is deployed at `https://104-mcp.vercel.app` for use as a [GPT Action](https://platform.openai.com/docs/actions).

**OpenAPI spec:** `https://104-mcp.vercel.app/openapi.json`

To add to a Custom GPT:
1. Go to [chat.openai.com/gpts](https://chat.openai.com/gpts) → Create
2. Click **Configure** → **Add actions**
3. Paste the OpenAPI spec URL above
4. Save and test

Available via GPT Actions (read-only, no auth required):
- `searchJobs` — search job listings
- `getJobDetail` — full job posting
- `searchCompanies` — search companies
- `getCompanyDetail` — company profile

## Notes

- No API key needed for read-only tools
- Auth uses 104's OIDC flow (Ory Hydra with PKCE)
- Apply/save require a valid 104.com.tw account
