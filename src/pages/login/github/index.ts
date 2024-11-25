import { github } from "~/lib/server/oauth";
import { generateState } from "arctic";

import type { APIContext } from "astro";

export const prerender = false;

export function GET(context: APIContext): Response {
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);
  
  // 添加 prompt=consent 参数以强制显示 GitHub 授权页面
  const finalUrl = new URL(url.toString());
  finalUrl.searchParams.set('prompt', 'consent');

  context.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax"
  });

  return context.redirect(finalUrl.toString());
}
