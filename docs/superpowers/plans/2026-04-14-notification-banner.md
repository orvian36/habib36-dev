# Notification Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dismissible notification banner at the top of every frontend page, controlled via a Payload CMS Global.

**Architecture:** A Payload Global (`Notification`) stores the message and visibility flag. A server component fetches it on each page load and conditionally renders a client component that handles dismissal via `sessionStorage`. The banner sits above `<ClientShell>` in the frontend layout.

**Tech Stack:** Payload CMS 3 (Globals API), Next.js 16, Framer Motion, Lucide React, Tailwind CSS v4

---

### Task 1: Create the Payload Global definition

**Files:**
- Create: `src/globals/Notification.ts`

- [ ] **Step 1: Create the global config file**

Create `src/globals/Notification.ts`:

```ts
import type { GlobalConfig } from 'payload'

export const Notification: GlobalConfig = {
  slug: 'notification',
  label: 'Notification Banner',
  admin: {
    description: 'Controls the dismissible notification bar shown at the top of every page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'message',
      type: 'text',
      required: true,
      label: 'Message',
      admin: {
        description: 'The text displayed in the notification banner.',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: false,
      label: 'Visible',
      admin: {
        description: 'Toggle to show or hide the banner on the site.',
      },
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/globals/Notification.ts
git commit -m "feat: add Notification global config for Payload CMS"
```

---

### Task 2: Register the global in Payload config

**Files:**
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Add the import and register the global**

In `src/payload.config.ts`, add the import at the top with the other imports:

```ts
import { Notification } from './globals/Notification'
```

Then add the `globals` array to the `buildConfig` call, after the `collections` line:

```ts
globals: [Notification],
```

The config should now include:

```ts
collections: [Users, Media, Projects, Posts],
globals: [Notification],
```

- [ ] **Step 2: Regenerate Payload types**

Run: `npm run generate:types`

Expected: `src/payload-types.ts` is updated with a `Notification` type containing `message` (string) and `visible` (boolean).

- [ ] **Step 3: Commit**

```bash
git add src/payload.config.ts src/payload-types.ts
git commit -m "feat: register Notification global in Payload config"
```

---

### Task 3: Create the NotificationBanner components

**Files:**
- Create: `src/components/layout/notification-banner.tsx`

- [ ] **Step 1: Create the component file**

Create `src/components/layout/notification-banner.tsx` with both the server wrapper and client component:

```tsx
import { getPayloadClient } from '@/lib/payload'
import { NotificationBarClient } from './notification-bar-client'

export async function NotificationBanner() {
  const payload = await getPayloadClient()
  const notification = await payload.findGlobal({ slug: 'notification' })

  if (!notification.visible || !notification.message) {
    return null
  }

  return <NotificationBarClient message={notification.message} />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/notification-banner.tsx
git commit -m "feat: add NotificationBanner server component"
```

---

### Task 4: Create the NotificationBarClient component

**Files:**
- Create: `src/components/layout/notification-bar-client.tsx`

- [ ] **Step 1: Create the client component**

Create `src/components/layout/notification-bar-client.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function hashMessage(message: string): string {
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(36)
}

export function NotificationBarClient({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(true)
  const storageKey = `notification-dismissed-${hashMessage(message)}`

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(storageKey)
    if (!wasDismissed) {
      setDismissed(false)
    }
  }, [storageKey])

  function handleDismiss() {
    sessionStorage.setItem(storageKey, '1')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-center bg-[var(--accent-orange)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)]">
            <span className="text-center pr-8">{message}</span>
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-black/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/notification-bar-client.tsx
git commit -m "feat: add NotificationBarClient with dismiss and animation"
```

---

### Task 5: Integrate the banner into the frontend layout

**Files:**
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Add the banner above ClientShell**

In `src/app/(frontend)/layout.tsx`, add the import at the top:

```tsx
import { NotificationBanner } from '@/components/layout/notification-banner'
```

Then update the `<body>` to include the banner above `<ClientShell>`:

```tsx
<body className="min-h-screen flex flex-col">
  <NotificationBanner />
  <ClientShell>{children}</ClientShell>
</body>
```

- [ ] **Step 2: Verify the dev server runs without errors**

Run: `npm run dev`

Expected: Server starts. Visit `http://localhost:3000` — no banner visible (default `visible` is `false`).

- [ ] **Step 3: Test via admin panel**

1. Go to `http://localhost:3000/admin`
2. Navigate to "Notification Banner" in the sidebar under Globals
3. Set message to "This site is under development" and check "Visible"
4. Save
5. Visit `http://localhost:3000` — banner should appear at the top in orange
6. Click X — banner dismisses
7. Refresh page — banner stays dismissed (sessionStorage)
8. Close and reopen the tab — banner reappears

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/layout.tsx
git commit -m "feat: integrate notification banner into frontend layout"
```
