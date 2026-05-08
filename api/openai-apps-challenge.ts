import type { IncomingMessage, ServerResponse } from "node:http";

const CHALLENGE_TOKEN =
  process.env.OPENAI_APPS_CHALLENGE_TOKEN ??
  "CcH1Oj1zuVqrpz-xS5PnV1ibCcyfaKDYi8DjqleV0rM";

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.statusCode = 200;
  res.end(CHALLENGE_TOKEN);
}
