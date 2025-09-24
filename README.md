# Rhythia Online API

This repo is a typed wrapper around Rhythia's backend endpoints. The helpers under `api/` are wired through `handleApi.ts` so consumers can call functions like `acceptInvite` or `createCollection` and let the shared client post to the hosted service while censoring stray profanity in responses.

Install dependencies with Bun, then reach for the scripts in `package.json`; `bun run dev` starts the local handler, `bun run test` exercises the contract tests, and `bun run pipeline:build-api` prepares the bundle that powers deployments. The production build is pushed to Vercel from the `main` branch, so anything merged there lands at the hosted Rhythia Online API a few moments later.

Runtime secrets live in environment variables. Upload endpoints expect `ACCESS_BUCKET` and `SECRET_BUCKET` for S3, the purchase flow checks `BUY_SECRET`, auth helpers derive tokens from `TOKEN_SECRET`, and the Supabase admin calls need `ADMIN_KEY`. The deploy script also looks for `GIT_USER`, `GIT_KEY`, `SOURCE_BRANCH`, and `TARGET_BRANCH` when the CI job mirrors changes upstream.

If you need to point at a different stack, call `setEnvironment` with `development`, `testing`, or `production` before making requests so the helper talks to the right Rhythia host.
