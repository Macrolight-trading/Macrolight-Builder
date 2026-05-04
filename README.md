# Macrolight Builder

## Production Admin Setup

1. Configure environment variables:
	- `DATABASE_URL`
	- `NEXTAUTH_SECRET`
	- `NEXTAUTH_URL`
2. Optionally set initial admin bootstrap vars:
	- `ADMIN_EMAIL`
	- `ADMIN_PASSWORD` (12+ characters)
	- `ADMIN_NAME`
3. Run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Seed Behavior

- No demo/default users, contacts, payments, or analytics data are inserted.
- Seed only creates or updates an admin user when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided.

### Remove Existing Default Data

If you previously seeded demo/default records, run:

```bash
npm run data:cleanup-defaults
```

## Local Development

```bash
npm install
npm run dev
```