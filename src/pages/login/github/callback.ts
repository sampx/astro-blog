import type { APIContext } from "astro";
import { github } from "~/lib/server/oauth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { createUser, getUserFromGitHubId } from "~/lib/server/user";
import { createSession, generateSessionToken, setSessionTokenCookie } from "~/lib/server/session";

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");

  if (!code || !state || !storedState) {
    return new Response("Missing required OAuth parameters", { status: 400 });
  }

  if (storedState !== state) {
    return new Response("Invalid state parameter", { status: 400 });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubAccessToken = tokens.accessToken();  // 修复：调用 accessToken() 函数

    // 获取用户信息
    const userRequest = new Request("https://api.github.com/user");
    userRequest.headers.set("Authorization", `Bearer ${githubAccessToken}`);
    const userResponse = await fetch(userRequest);
    const userResult: unknown = await userResponse.json();
    const userParser = new ObjectParser(userResult);

    const githubUserId = userParser.getNumber("id");
    const username = userParser.getString("login");

    // 检查现有用户
    const existingUser = getUserFromGitHubId(githubUserId);
    if (existingUser !== null) {
      const sessionToken = generateSessionToken();
      const session = createSession(sessionToken, existingUser.id);
      setSessionTokenCookie(context, sessionToken, session.expiresAt);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // 获取邮箱信息
    const emailListRequest = new Request("https://api.github.com/user/emails");
    emailListRequest.headers.set("Authorization", `Bearer ${githubAccessToken}`);
    const emailListResponse = await fetch(emailListRequest);
    const emailListResult: unknown = await emailListResponse.json();
    
    if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
      return new Response("No email found", { status: 400 });
    }

    let email: string | null = null;
    for (const emailRecord of emailListResult) {
      const emailParser = new ObjectParser(emailRecord);
      const primaryEmail = emailParser.getBoolean("primary");
      const verifiedEmail = emailParser.getBoolean("verified");
      if (primaryEmail && verifiedEmail) {
        email = emailParser.getString("email");
      }
    }

    if (email === null) {
      return new Response("Please verify your GitHub email address", { status: 400 });
    }

    // 创建新用户
    const user = createUser(githubUserId, email, username);
    const sessionToken = generateSessionToken();
    const session = createSession(sessionToken, user.id);
    setSessionTokenCookie(context, sessionToken, session.expiresAt);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return new Response("Authentication failed. Please try again.", { status: 500 });
  }
}
