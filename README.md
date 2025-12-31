# Shopkart

A full-stack e-commerce demo app with separate `backend` (Node/Express) and `frontend` (Vite + React + TypeScript) folders.

## Overview

This repository contains the backend API and frontend client for Shopkart — a sample online shopping application used for development, testing and demoing common e-commerce flows (auth, products, cart, orders, payments, addresses, chat).

## Features

- User authentication and profile management
- Product listing, details and search
- Cart, checkout and order processing
- Address management with location picker
- Simple chat/notification utilities

## Repository layout

- `backend/` — Node.js API server, controllers, models and routes
- `frontend/` — Vite + React + TypeScript client app

## Prerequisites

- Node.js (v16+ recommended)
- npm (or pnpm/yarn if you prefer)
- Optional: a running database (Postgres/MySQL) if you wire the backend to one

## Quick start

Open two terminals for the backend and frontend.

Backend:

```bash
cd backend
npm install
# Start the server (use `npm run dev` if available for hot-reload)
npm run dev || npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
# or
npm start
```

Note: If `npm run dev` isn't defined, use `npm start` (check `backend/package.json` and `frontend/package.json`).

## Environment variables

The backend may expect environment variables for database connection, JWT secrets, and payment keys. Create a `.env` file inside `backend/` with values like:

```
PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/shopkart
JWT_SECRET=your_jwt_secret
# Add any payment provider keys or other secrets here
```

Adjust names to match the backend code or `config` files.

## Common scripts

- Install dependencies: `npm install`
- Run dev server (if configured): `npm run dev`
- Start production server: `npm start`
- Audit dependencies: `npm audit` / `npm audit fix`

## Database

A `schema.sql` file exists in `backend/` that can be used as a starting point for setting up the database schema. Review and adapt to your DB engine.

## Linting & TypeScript

The frontend uses TypeScript and Vite. Run any configured linters or type checks via the scripts in `frontend/package.json`.

## Tests

If tests are present, run them with the project's test script (check `package.json`). Example:

```bash
npm test
```

## Contributing

- Fork the repo and create a feature branch
- Run and test changes locally
- Submit a pull request with a clear description of your changes

## Security & Maintenance

- Regularly run `npm audit` and `npm audit fix` for both `backend` and `frontend`
- Commit `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` after changing dependencies

## Files of interest

- [backend](backend) — API server source
- [frontend](frontend) — Client app source
- [backend/schema.sql](backend/schema.sql) — Example DB schema

## License

Specify your license here (e.g., MIT) or add a `LICENSE` file at project root.

## Contact

For questions or contributions, open an issue or submit a pull request.
