# Deployment

## Environment Variables

Two public variables are required. They are safe to expose to the browser (Supabase publishable key, not the secret key).

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |

Copy `.env.example` to `.env` and fill in your values.

---

## Local Development

```bash
pnpm install
# Set up .env with Supabase credentials
pnpm dev        # hot-reload dev server on http://localhost:5173
```

Database setup (first time):
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Run `supabase/seed.sql` to load initial products.

---

## Production Build

```bash
pnpm build      # compiles to build/
pnpm preview    # preview the production build locally
```

The build output is a Node.js application in `build/`. Start it with:

```bash
node build
```

Default port is 3000. Set `PORT` and `HOST` environment variables to override.

---

## Docker

A multi-stage `dockerfile` is included at the project root.

### Build

```bash
docker build -t eshop-prototype .
```

### Run

```bash
docker run -p 3000:3000 \
  -e PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  eshop-prototype
```

### Dockerfile stages

**Stage 1 — builder (`node:22-alpine`)**
1. Copy `package.json` and `pnpm-lock.yaml`.
2. `pnpm install --frozen-lockfile` — reproducible install.
3. Copy source files.
4. `pnpm build` — compile SvelteKit to `build/`.

**Stage 2 — runtime (`node:22-alpine`)**
1. Copy `build/` and `node_modules/` from the builder.
2. Copy `package.json`.
3. Expose port 3000.
4. `CMD ["node", "build"]`

The final image contains only the compiled output and production dependencies — no source files or dev tools.

---

## NPM Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite dev` | Dev server with HMR |
| `build` | `vite build` | Production build to `build/` |
| `preview` | `vite preview` | Serve production build locally |
| `check` | `svelte-kit sync && svelte-check` | Type checking |
| `check:watch` | `...` | Type checking in watch mode |
| `lint` | `prettier --check .` | Verify formatting |
| `format` | `prettier --write .` | Auto-format all files |

---

## Hosting Notes

The app is hosted at **https://eshop-prototype.mtzel.com**.

Because the adapter is `@sveltejs/adapter-node`, the app can be deployed to any platform that runs Node.js containers or processes — Docker-based platforms (Railway, Fly.io, Render, AWS ECS), or traditional VMs. It does **not** use the Vercel or Netlify adapters.

The Supabase database is fully managed — no database infrastructure to provision or maintain.
