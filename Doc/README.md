# Pitonenterprise — Documentation

This `Doc/` folder is the **living source of truth** for the project. Every architectural
decision, schema change, new feature, and convention is recorded here and kept **up to date**
as the codebase evolves.

> Rule: whenever the architecture, data model, env vars, or major features change, the
> relevant file in this folder MUST be updated in the same change.

## Index

| File | What it covers |
|------|----------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level system architecture, how the pieces fit together |
| [TECH_STACK.md](./TECH_STACK.md) | Chosen technologies and the rationale behind each decision |
| [DATA_MODEL.md](./DATA_MODEL.md) | Payload collections, fields, relationships (the schema) |
| [SEO.md](./SEO.md) | SEO strategy: metadata, sitemaps, structured data, performance |
| [I18N.md](./I18N.md) | Multi-language and multi-currency approach |
| [PAYMENTS.md](./PAYMENTS.md) | Stripe + Razorpay integration design |
| [ENV.md](./ENV.md) | Every environment variable, what it does, where to get it |
| [ROADMAP.md](./ROADMAP.md) | Phased build plan and current progress |
| [CHANGELOG.md](./CHANGELOG.md) | Running log of notable changes, newest first |

## Project summary

**Pitonenterprise** is a worldwide e-commerce store for sarees, dresses, and ethnic wear.
Primary goals, in priority order:

1. **Best-in-class SEO** — rank globally, fast pages, rich structured data.
2. **Premium UI/UX** — clean, modern, conversion-focused storefront.
3. **Worldwide selling** — multi-currency + multi-language, global + India payments.
4. **Easy management** — Payload CMS admin for products, orders, media, content.
