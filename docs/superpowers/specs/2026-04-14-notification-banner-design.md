# Notification Banner — Design Spec

## Overview

A dismissible notification bar at the top of every frontend page, controlled from the Payload CMS admin panel. Designed as a single-instance global config — one message, one visibility toggle.

## Payload Global: `Notification`

**Location:** `src/globals/Notification.ts`

A Payload **Global** (not a Collection) with two fields:

| Field     | Type       | Required | Default | Description                          |
|-----------|------------|----------|---------|--------------------------------------|
| `message` | `text`     | yes      | —       | The notification text to display     |
| `visible` | `checkbox` | no       | `false` | Whether the banner is shown publicly |

**Registration:** Add to `globals` array in `src/payload.config.ts`.

## Frontend Components

### `NotificationBanner` (server component)

**Location:** `src/components/layout/notification-banner.tsx`

- Fetches the `notification` global via `getPayloadClient()`
- If `visible` is `false` or `message` is empty, returns `null`
- Renders `<NotificationBarClient message={message} />`

### `NotificationBarClient` (client component)

**Location:** Same file, or inline within the server component file.

- Receives `message` as a prop
- On mount, checks `sessionStorage` for key `notification-dismissed-{hash}` where `hash` is a simple hash of the message string
- If dismissed, renders nothing
- Otherwise renders the banner with a close button
- On close, sets the `sessionStorage` key and hides the banner

### Styling

- Full-width bar, fixed or static at the very top of the viewport (above navbar)
- Background: amber/yellow tone or theme-appropriate accent
- Text: small, centered, single line
- Close button: `X` icon on the right side (Lucide `X` icon)
- Smooth exit animation via Framer Motion

## Integration Point

In `src/components/layout/client-shell.tsx`:

- Add `<NotificationBanner />` as the first child inside the outer `<div>`, above `<Preloader />`
- Since the banner is a server component calling Payload, and `ClientShell` is a client component, the banner must be rendered **outside** `ClientShell` in the frontend layout (`src/app/(frontend)/layout.tsx`) and positioned above it, OR passed as a prop/slot. The cleaner approach: render the banner directly in the frontend layout, before `<ClientShell>`.

**Revised integration:** Place `<NotificationBanner />` in `src/app/(frontend)/layout.tsx`, above `<ClientShell>`. This keeps server/client boundaries clean.

## Data Flow

```
Admin sets message + visible=true in /admin
  -> Page request hits server
  -> NotificationBanner (server) fetches global
  -> visible=true && message exists -> renders NotificationBarClient
  -> Client checks sessionStorage for dismissal
  -> Not dismissed -> shows banner
  -> User clicks X -> sessionStorage stores "notification-dismissed-{hash}"
  -> Banner hides with animation
  -> New message from admin -> different hash -> banner reappears
```

## Dismissal Logic

- Storage: `sessionStorage` (clears on tab close)
- Key format: `notification-dismissed-{hash}`
- Hash: simple string hash of the message content (e.g., sum of char codes mod a large number)
- Changing the message in admin resets dismissal for all users (new hash)

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/globals/Notification.ts` |
| Modify | `src/payload.config.ts` (add global) |
| Create | `src/components/layout/notification-banner.tsx` |
| Modify | `src/app/(frontend)/layout.tsx` (add banner above ClientShell) |
| Regenerate | `src/payload-types.ts` (via `npm run generate:types`) |

## Out of Scope

- Multiple simultaneous notifications
- Rich text / HTML in the message
- Scheduling (show/hide by date)
- Analytics on dismissal
