# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | SvelteKit | 2.x |
| UI Language | Svelte (runes mode) | 5.x |
| Language | TypeScript | 6.0.2 |
| Build tool | Vite | 8.0.7 |
| CSS | Tailwind CSS | 4.2.2 |
| Database | Supabase (PostgreSQL) | — |
| DB Client | @supabase/supabase-js | 2.106.1 |
| Adapter | @sveltejs/adapter-node | — |
| Package manager | pnpm | — |
| Container | Docker (node:22-alpine) | — |

### Tailwind Plugins

- `@tailwindcss/forms` — styled form elements
- `@tailwindcss/typography` — rich text (product descriptions)
- `prettier-plugin-tailwindcss` — automatic class sorting

## Project Structure

```
/
├── src/
│   ├── app.html                  # HTML shell
│   ├── lib/
│   │   ├── components/           # Shared UI components
│   │   ├── stores/               # Svelte reactive stores
│   │   ├── supabaseClient.ts     # Supabase singleton
│   │   └── types.ts              # Shared TypeScript interfaces
│   └── routes/
│       ├── +layout.svelte        # Root layout (header, nav, footer)
│       ├── layout.css            # Global styles
│       ├── +page.svelte          # Home page
│       ├── products/[id]/
│       ├── search/
│       ├── cart/
│       ├── checkout/
│       ├── order/[id]/
│       ├── returns/[order_id]/
│       └── faq/
├── supabase/
│   ├── schema.sql                # Table definitions and indexes
│   └── seed.sql                  # Initial product data
├── static/                       # Public static assets
├── dockerfile                    # Multi-stage production build
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

## Configuration

### `svelte.config.js`

```js
{
  compilerOptions: {
    runes: true   // Svelte 5 runes mode enabled globally
  },
  kit: {
    adapter: adapter()  // @sveltejs/adapter-node
  }
}
```

### `vite.config.ts`

```ts
plugins: [tailwindcss(), sveltekit()]
```

Tailwind CSS runs as a Vite plugin (v4 approach — no `tailwind.config.js` needed).

### `tsconfig.json`

Extends the auto-generated `.svelte-kit/tsconfig.json` with strict mode enabled:

```json
{
  "strict": true,
  "allowJs": true,
  "checkJs": true,
  "sourceMap": true,
  "resolveJsonModule": true
}
```

## Supabase Client

A single shared client is instantiated in `src/lib/supabaseClient.ts` using the public environment variables:

```ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
```

The client is imported directly in server load functions and form actions — there is no server-side service layer.

## Styling Architecture

- All styling is via Tailwind utility classes — no custom CSS outside `layout.css`.
- `layout.css` contains global rules (print styles, scrollbar styling, resets).
- Layout uses `max-w-6xl` (1152px) content containers, mobile-first responsive breakpoints.
- Component styles live inline in each `.svelte` file's `<style>` block when needed.

## TypeScript Types

Core domain types are defined in `src/lib/types.ts`:

- `Product` — catalogue item with sizes and stock
- `Review` — star rating + comment on a product
- `OrderItem` — line item snapshot (name, size, price, qty)
- `Order` — order record with JSONB item snapshot
- `ReturnItem` — item in a return request with reason
- `ExchangeItem` — replacement item requested in exchange
- `Return` — return record with status and exchange preferences

See [database.md](database.md) for the corresponding schema.
