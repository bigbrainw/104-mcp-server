# 104 MCP Server — Marketing Guide

## MCP Directories (Submit First)

| Directory | URL | Notes |
|-----------|-----|-------|
| mcp.so | mcp.so | Biggest directory |
| Smithery | smithery.ai | Has install button, good for non-technical users |
| Glama | glama.ai/mcp/servers | Submit via GitHub PR |
| PulseMCP | pulsemcp.com | Auto-discovers or manual submit |
| Anthropic official | github.com/modelcontextprotocol/servers | PR under "community servers" |

## Tier 1 — Hit These First

| Community | Platform | Size | Why |
|-----------|----------|------|-----|
| Claude Official Discord | Discord | 93k members | MCP builders live here — `#mcp-servers` channel |
| Glama MCP Registry | glama.ai | 22k+ servers | Dev discovery hub |
| modelcontextprotocol/servers | GitHub | — | Official Anthropic list |
| r/ClaudeAI | Reddit | Large | AI tool announcements |

## Tier 2 — Taiwan Tech Devs

| Community | Platform | Size | Language |
|-----------|----------|------|----------|
| Front-End Developers Taiwan | Facebook Group | 20k | 中文 |
| Full Stack Taiwan | GitHub/Meetup | 5k | 中文 |
| GDG Taipei | Meetup | 2k | EN/中文 |
| SITCON | Telegram/FB | 5k students | 中文 |
| LINE Developers Taiwan | Facebook | 10k | 中文/EN |

## Tier 3 — Job/Career Angle

| Community | Platform | Notes |
|-----------|----------|-------|
| Forumosa Jobs | tw.forumosa.com | English-speaking expats in Taiwan |
| Taiwan Gold Card Community | taiwangoldcard.com | High-skilled foreign engineers in Taiwan |
| Career-Ops Discord | discord.gg/8pRpHETxa4 | 2k people using AI for job hunting — perfect fit |
| AppWorks | appworks.tw | Largest Taiwan startup accelerator |

## Tier 4 — Broader Tech

| Community | Platform | Size |
|-----------|----------|------|
| Hacker News | news.ycombinator.com | "Show HN: MCP server for Taiwan's largest job board" |
| Product Hunt | producthunt.com | 500k monthly users |
| r/taiwan | Reddit | 500k members |
| LangChain Community | Slack | 10k AI devs |

## Action Order

**Week 1:**
1. Post in Claude Discord `#mcp-servers`
2. Submit to Glama + mcp.so
3. PR to `modelcontextprotocol/servers` README

**Week 2–3:**
4. Post in Front-End Developers Taiwan FB group
5. Post in Career-Ops Discord
6. Submit to Smithery + PulseMCP

**Month 2:**
7. Hacker News "Show HN" post
8. Product Hunt launch
9. GDG Taipei talk proposal

## Discord Announcement Template

Post in Claude Discord `#mcp-servers`:

```
**104.com.tw MCP Server** — Taiwan's largest job platform in Claude

Search jobs, browse companies, and apply — all from Claude Desktop.

Tools: search_jobs, get_job_detail, search_companies, get_company_detail, login, apply_job, save_job

Install:
{
  "mcpServers": {
    "104": {
      "command": "npx",
      "args": ["-y", "mcp-104jobs"]
    }
  }
}

npm: https://www.npmjs.com/package/mcp-104jobs
GitHub: [your repo link]
```

## Notes

- npm package already published: `mcp-104jobs@1.0.0`
- Add Traditional Chinese docs to README — target users are Taiwanese, Chinese description helps search
- Add a badge to README after getting listed on mcp.so / Smithery
- Threads API automation: need official API token from developers.facebook.com (not raw credentials)
