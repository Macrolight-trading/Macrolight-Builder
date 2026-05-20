# Cal.com — Book a Call setup

The `/portal/book-a-call` page embeds Cal.com's booking widget and mirrors
every booking into the local `Booking` table via webhook. Follow the steps
below once to wire it up.

## 1. Install the embed dependency

```
npm install
```

(The `@calcom/embed-react` package was added to `package.json`.)

## 2. Migrate the database

A new `Booking` model and `BookingStatus` enum were added.

```
npx prisma generate
npx prisma migrate dev --name bookings
```

## 3. Create the Cal.com event type

1. Sign up at https://cal.com (free tier works) or use your existing
   account.
2. Connect your Google Calendar under **Settings → Calendars** so Cal can
   read availability and write events.
3. Under **Event Types**, create a new event:
   - **Title**: Strategy Call (or whatever you want to brand it as)
   - **URL slug**: `strategy-call` (this is your event slug)
   - **Duration**: 30 minutes (or whatever)
   - **Location**: Cal Video / Google Meet / Zoom — your choice
4. Note your username and the slug — together they form your booking
   URL: `https://cal.com/{username}/{slug}`.

## 4. Set environment variables

Add these to `.env.local` (dev) and your Vercel project env (prod):

```
NEXT_PUBLIC_CAL_USERNAME=bradley-bayley
NEXT_PUBLIC_CAL_EVENT_SLUG=strategy-call

# Optional — defaults to https://cal.com if unset. Override if you're
# self-hosting Cal.com on your own domain.
NEXT_PUBLIC_CAL_BASE_URL=https://cal.com

# Webhook secret — see step 5.
CAL_WEBHOOK_SECRET=replace-with-a-random-long-string
```

The two `NEXT_PUBLIC_` vars are read on the client to construct the
embed URL. `CAL_WEBHOOK_SECRET` is server-only — used to verify HMAC
signatures on incoming webhooks.

## 5. Configure the webhook

1. In Cal.com, go to **Settings → Developer → Webhooks → New**.
2. **Subscriber URL**: `https://macrolight-builder.com/api/cal/webhook`
   (use your local tunnel URL for dev — e.g. via ngrok).
3. **Secret**: paste the same value you used for `CAL_WEBHOOK_SECRET`.
4. **Event Triggers** — subscribe to at least:
   - `BOOKING_CREATED`
   - `BOOKING_RESCHEDULED`
   - `BOOKING_CANCELLED`
   - `BOOKING_REJECTED`
   - `MEETING_ENDED` (optional — lets us auto-mark calls COMPLETED)
5. **Payload template**: leave default.
6. Save.

## 6. Verify

1. Run `npm run dev`.
2. Sign in to the portal, navigate to **Book a Call**.
3. The embed loads inline. Pick a time and complete a booking.
4. Cal.com sends the webhook to `/api/cal/webhook`.
5. Refresh the page — your booking now appears in the "Upcoming calls"
   list with reschedule + cancel links.

## How it all fits together

```
User on /portal/book-a-call
   │
   ├── Cal.com embed (iframe) renders inline
   │      └── User picks a time → submits booking on Cal.com
   │
   └── Cal.com sends BOOKING_CREATED webhook to /api/cal/webhook
          │
          ├── Verify HMAC signature
          ├── Match attendee email → User row
          └── prisma.booking.upsert({ ... })

User reloads /portal/book-a-call
   └── Page server-renders upcoming bookings from DB
```

## Files added

```
prisma/schema.prisma                              + Booking model, BookingStatus enum, User.bookings
components/portal/CalEmbed.tsx                    NEW — client-side Cal embed wrapper
components/portal/PortalShell.tsx                 + Book a Call nav entry + CalendarIcon
app/portal/book-a-call/page.tsx                   NEW — server page with embed + upcoming list
app/api/cal/webhook/route.ts                      NEW — signature-verified webhook
package.json                                      + @calcom/embed-react
```

## Notes & follow-ups

- **Non-customer bookings**: if someone books with an email that doesn't
  match any User, the webhook logs it and skips the DB write. If you
  want to capture those as CRM leads, the handler is a good place to
  add `prisma.lead.create(...)`.
- **Admin view**: there's no `/admin/portal/bookings` page yet. Easy to
  add — just `prisma.booking.findMany({ include: { user: true } })`
  filtered by date.
- **Multiple call types**: if you later want different call types
  (intro vs. check-in vs. content review), create more event types in
  Cal.com and surface them as tabs above the embed. The `callType`
  field on `Booking` already stores the slug, ready for filtering.
- **Self-hosting Cal.com**: if you ever move off the hosted version,
  update `NEXT_PUBLIC_CAL_BASE_URL` to point at your instance. The
  embed code respects it automatically.
