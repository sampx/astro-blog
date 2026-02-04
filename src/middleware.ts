import { defineMiddleware, sequence } from "astro:middleware";
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from "~/lib/server/session";

const authMiddleware = defineMiddleware((context, next) => {
  const token = context.cookies.get("session")?.value ?? null;
  if (token === null) {
    context.locals.session = null;
    context.locals.user = null;
    return next();
  }
  const { user, session } = validateSessionToken(token);
  if (session !== null) {
    setSessionTokenCookie(context, token, session.expiresAt);
  } else {
    deleteSessionTokenCookie(context);
  }
  context.locals.session = session;
  context.locals.user = user;
  return next();
});

export const onRequest = sequence(authMiddleware);
