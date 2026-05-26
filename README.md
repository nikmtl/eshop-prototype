# E-Shop Prototype

A fashion e-commerce prototype built as part of a university research project about customer satisfaction in online shopping environments.

## Purpose

This prototype simulates a realistic online fashion store to serve as a controlled research instrument. Participants interact with a fully functional shopping experience — browsing products, reading reviews, managing a cart, and placing orders — as an example project on how to design and implement such systems.


## Tech Stack

- **Framework:** SvelteKit 2 with Svelte 5
- **Styling:** Tailwind CSS 4 (with Typography and Forms plugins)
- **Backend / Database:** Supabase (PostgreSQL)
- **Language:** TypeScript

## Local Installation

For the first few months after submission, the prototype will be available for public use at [https://eshop-prototype.mtzel.com](https://eshop-prototype.mtzel.com). However, to ensure long-term availability and allow for modifications, you can also run the prototype locally by following these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [Supabase](https://supabase.com/) project (free tier is fine)

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd eshop-prototype
pnpm install
```

### 2. Set up the database

In your Supabase project, open the SQL editor and run the schema and seed files in order:

```
supabase/schema.sql   ← creates tables
supabase/seed.sql     ← populates sample products, reviews, etc.
```

### 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Open `.env` and set:

```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

Find these values in your Supabase dashboard under **Project Settings → API**.

### 4. Start the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run Svelte type checking |
| `pnpm format` | Format code with Prettier |

## Technical Documentation
Detailed technical documentation is available in the `docs` folder, covering architecture, database design, routes, state management, features, and deployment instructions.

| File | Description |
|------|-------------|
| [architecture.md](./docs/architecture.md) | Tech stack, project structure, configuration |
| [database.md](./docs/database.md) | PostgreSQL schema, tables, indexes, seed data |
| [routes.md](./docs/routes.md) | SvelteKit route structure and page responsibilities |
| [state-management.md](./docs/state-management.md) | Svelte stores (cart, demo tour, return flow) |
| [features.md](./docs/features.md) | Feature descriptions and data flows |
| [deployment.md](./docs/deployment.md) | Build process, Docker, environment variables |
