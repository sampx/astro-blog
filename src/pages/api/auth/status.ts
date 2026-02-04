import type { APIContext } from "astro";

export const prerender = false;

export function GET(context: APIContext): Response {
  if (!context.locals.session || !context.locals.user) {
    return new Response(null, { status: 401 });
  }

  return new Response(
    JSON.stringify({
      username: context.locals.user.username,
      email: context.locals.user.email,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
