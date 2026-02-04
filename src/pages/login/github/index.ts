import { github } from "~/lib/server/oauth";
import { generateState } from "arctic";

import type { APIContext } from "astro";

export const prerender = false;

export function GET(context: APIContext): Response {
  const state = generateState();
  const redirect = context.url.searchParams.get("redirect");
  const url = github.createAuthorizationURL(state, ["user:email"]);

  // 添加 prompt=consent 参数以强制显示 GitHub 授权页面
  const finalUrl = new URL(url.toString());
  finalUrl.searchParams.set("prompt", "consent");

  // 保存重定向 URL 到 cookie
  if (redirect) {
    context.cookies.set("github_oauth_redirect", redirect, {
      httpOnly: true,
      maxAge: 60 * 10,
      secure: import.meta.env.PROD,
      path: "/",
      sameSite: "lax",
    });
  }

  context.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });

  return context.redirect(finalUrl.toString());
}
