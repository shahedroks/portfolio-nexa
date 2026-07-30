/**
 * One-time helper: get GOOGLE_REFRESH_TOKEN for Calendar + Meet.
 *
 * 1. Google Cloud Console → APIs → enable "Google Calendar API"
 * 2. OAuth client → Authorized redirect URIs → add:
 *    http://localhost:3456/oauth2callback
 * 3. OAuth consent screen → add yourself as Test user
 * 4. Run: node scripts/get-google-refresh-token.mjs
 * 5. Paste the printed refresh_token into .env as GOOGLE_REFRESH_TOKEN
 */

import http from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");
const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/calendar";

function loadEnvFile() {
  if (!existsSync(envPath)) {
    throw new Error(".env not found. Create it first.");
  }
  const map = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    map[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return map;
}

function upsertEnv(key, value) {
  let text = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(text)) {
    text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    text = `${text.trimEnd()}\n${line}\n`;
  }
  writeFileSync(envPath, text, "utf8");
}

const env = loadEnvFile();
const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const error = url.searchParams.get("error");
    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(`OAuth error: ${error}`);
      server.close();
      return;
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing code");
      return;
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await tokenRes.json();

    if (!tokenRes.ok || !json.refresh_token) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify(json, null, 2));
      console.error("Token exchange failed:", json);
      server.close();
      return;
    }

    upsertEnv("GOOGLE_REFRESH_TOKEN", json.refresh_token);
    console.log("\nGOOGLE_REFRESH_TOKEN saved to .env");
    console.log(json.refresh_token);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Success</h1><p>Refresh token saved to <code>.env</code>. You can close this tab.</p>",
    );
    server.close();
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(err));
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("\n1) Ensure redirect URI is added in Google Cloud:");
  console.log(`   ${REDIRECT_URI}`);
  console.log("\n2) Open this URL, sign in with the host Google account:\n");
  console.log(authUrl.toString());
  console.log("\nWaiting for OAuth callback…");
});
