# Sharif Store

Next.js storefront homepage for The Sharif Store. Products, categories, prices,
sale states, and product images are loaded from the existing WooCommerce Store
API.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Motion
- WooCommerce Store API

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default API origin is `https://thesharifstore.in`. To use another
WordPress installation, copy `.env.example` to `.env.local` and change
`WORDPRESS_URL`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```
