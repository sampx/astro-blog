# Agent Coding Guidelines

## Build & Quality Commands

```bash
# Development
pnpm dev              # Start dev server

# Building
pnpm build            # Production build
pnpm preview          # Preview production build

# Quality Checks (run these before committing)
pnpm check            # Run all checks (astro + eslint + prettier)
pnpm check:astro      # Type checking for Astro/TS files
pnpm check:eslint     # Linting
pnpm check:prettier   # Formatting check

# Auto-fix
pnpm fix              # Fix all issues
pnpm fix:eslint       # Fix linting issues
pnpm fix:prettier     # Fix formatting issues
```

Note: This project has no test suite. Always run `pnpm check` after making changes.

## Code Style Guidelines

### File Organization

- `src/components/` - Reusable UI components (`.astro`, `.tsx`)
- `src/lib/server/` - Server-side logic (database, auth, sessions)
- `src/utils/` - Pure utility functions
- `src/pages/` - File-based routing
- `src/content/post/` - Markdown blog posts
- `src/content/products/` - Markdown tutorial products
- `src/layouts/` - Page layout templates

### Naming Conventions

- **Files**: kebab-case (`toggle-theme.astro`, `auth-buttons-client.tsx`)
- **Components**: PascalCase (`ToggleTheme`, `AuthButtonsClient`)
- **Functions/Variables**: camelCase (`getUserFromGitHubId`, `validateSessionToken`)
- **Constants**: SCREAMING_SNAKE_CASE (`APP_BLOG`, `BLOG_BASE`)
- **Interfaces/Types**: PascalCase, often suffixed with `...Props` or `...Result`

### Imports

- Use `~` alias for all src imports: `import { foo } from '~/lib/server/db'`
- Group imports: external packages first, then local imports
- Explicit file extensions for non-TypeScript imports in Astro files

### TypeScript

- Strict mode enabled with `strictNullChecks`
- Define interfaces at file top or in `src/types.d.ts`
- Use `interface` for object shapes, `type` for unions/primitives
- Never use `any` - use `unknown` or proper types
- Destructured params prefixed with underscore: `({ _unused, used }) => {}`

### Astro Components

```astro
---
// Frontmatter: imports, interfaces, props, logic
import { Icon } from 'astro-icon/components';
import type { Props } from '~/types';

const { prop1 = 'default', prop2 } = Astro.props;
---

<!-- Template: JSX-like syntax -->
<div class={prop1}>
  {condition && <Component />}
</div>
```

- Use `---` fences to separate frontmatter from template
- Props interfaces named `Props` at top of frontmatter
- Use Astro's `class:list` for conditional classes
- Use `set:html` for raw HTML, not `dangerouslySetInnerHTML`

### React Components

- Functional components with hooks (`useState`, `useEffect`)
- Use `export default function ComponentName()`
- Type props with interfaces
- Cleanup in `useEffect` return functions
- Handle errors with try/catch, log to console

### Error Handling

- Server: Return appropriate HTTP status codes (401, 404, 500)
- Client: Try/catch async operations, log errors, show user feedback
- Database: Check for null returns from queries
- API routes: Always check `context.locals.session` for auth

### Styling

- Tailwind CSS for all styling
- Use `class:list` directive for conditional classes in Astro
- Avoid inline styles unless necessary
- Dark mode: use `dark:` prefix consistently
- Component classes follow BEM-like naming in existing codebase

### Database (SQLite)

- Use `@pilcrowjs/db-query` via `db` instance from `~/lib/server/db`
- Always use prepared statements with parameterized queries
- Handle null return values from `db.queryOne()`
- Execute DDL/updates with `db.execute()`

### Authentication

- Session-based auth using cookies named "session"
- Validate sessions via `~/lib/server/session.ts`
- Use `Astro.locals.session` and `Astro.locals.user` in pages
- Middleware: `~/src/middleware.ts` handles session validation
- OAuth flows via `~/lib/server/oauth.ts`

### Routing

- File-based routing in `src/pages/`
- Static: `.astro` files are pre-rendered
- Dynamic: Set `export const prerender = false;` for SSR
- API routes: `.ts` files export GET/POST functions returning Response
- Catch-all: `[...param].astro` for nested routes

### Content

- Blog posts in `src/content/post/`
- Frontmatter schema defined in `src/content/config.ts`
- Required fields: `title`, `publishDate` (defaults to now)
- Optional: `excerpt`, `image`, `tags`, `category`, `author`, `draft`, `protected`
- Use `~/utils/blog.ts` to fetch/query posts

### Products (Tutorials)

- Tutorial products in `src/content/products/`
- Schema:
  - `title`: Product name
  - `price`: Number (CNY)
  - `description`: Short description
  - `image`: Cover image path
- Payment Flow: Manual QR code display on detail page (no external payment gateway integrated yet)

### Environment Variables

- Stored in `.env` (gitignored)
- Access via `import.meta.env.PROD`, `import.meta.env.DEV`
- Never commit `.env` files

## Git Workflow

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Run `pnpm check` before committing
- Small, focused commits
- Test locally before pushing

## Security

- Never commit secrets or API keys
- Use prepared statements for all DB queries
- Validate user input on server side
- Session cookies: httpOnly, secure in production, sameSite: lax
- Check authentication status before protected actions

### Content Protection Strategy

- **Protected Posts**:
  - Add `protected: true` to frontmatter.
  - Logic is handled in `src/components/blog/SinglePost.astro`.
  - Use `ProtectedContent` component to conditionally render body.
  - Unauthenticated users see a lock icon and login prompt.

### Authentication Implementation

- **Provider**: GitHub OAuth (`src/pages/login/github/index.ts`).
- **Storage**: SQLite `session` and `user` tables.
- **Middleware**: `src/middleware.ts` runs on every request:
  - Validates `session` cookie.
  - Populates `Astro.locals.user` & `Astro.locals.session`.
  - Handles session expiration and renewal automatically.
