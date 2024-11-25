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
  const error = context.url.searchParams.get("error");
  const errorDescription = context.url.searchParams.get("error_description");
  const storedRedirect = context.cookies.get("github_oauth_redirect")?.value ?? "/";

  // 清除 OAuth 相关的 cookie
  context.cookies.delete("github_oauth_state", { path: "/" });
  context.cookies.delete("github_oauth_redirect", { path: "/" });

  // 如果用户取消了授权
  if (error === "access_denied") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${encodeURIComponent(errorDescription || "Access denied")}&redirect=${encodeURIComponent(storedRedirect)}`,
      },
    });
  }

  // 检查必要的参数
  if (!code || !state || !storedState) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${encodeURIComponent("Missing required parameters")}&redirect=${encodeURIComponent(storedRedirect)}`,
      },
    });
  }

  // 验证状态参数
  if (storedState !== state) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${encodeURIComponent("Invalid state parameter")}&redirect=${encodeURIComponent(storedRedirect)}`,
      },
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubAccessToken = tokens.accessToken();

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
      
      // 返回一个HTML页面，该页面会关闭自己并让父窗口跳转
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>登录成功</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.location.href = "${storedRedirect}";
                window.close();
              } else {
                window.location.href = "${storedRedirect}";
              }
            </script>
          </body>
        </html>
      `, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // 获取邮箱信息
    const emailListRequest = new Request("https://api.github.com/user/emails");
    emailListRequest.headers.set("Authorization", `Bearer ${githubAccessToken}`);
    const emailListResponse = await fetch(emailListRequest);
    const emailListResult: unknown = await emailListResponse.json();
    const emailListParser = new ObjectParser(emailListResult);

    const primaryEmail = emailListParser
      .getArray()
      .find((email) => email.getBoolean("primary"))
      ?.getString("email");

    if (!primaryEmail) {
      throw new Error("No primary email found");
    }

    // 创建新用户
    const user = createUser({
      githubId: githubUserId,
      username: username,
      email: primaryEmail,
    });

    // 创建会话
    const sessionToken = generateSessionToken();
    const session = createSession(sessionToken, user.id);
    setSessionTokenCookie(context, sessionToken, session.expiresAt);

    // 返回一个HTML页面，该页面会关闭自己并让父窗口跳转
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>登录成功</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.location.href = "${storedRedirect}";
              window.close();
            } else {
              window.location.href = "${storedRedirect}";
            }
          </script>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error during GitHub OAuth:", error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${encodeURIComponent("Authentication failed")}&redirect=${encodeURIComponent(storedRedirect)}`,
      },
    });
  }
}
