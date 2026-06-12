# Google Tag Manager — Setup Guide

GTM is integrated app-wide in the AsaanRabta client (Next.js App Router). This
doc covers both the **app-side** wiring (already in code) and the **GTM-side**
container configuration (done in the GTM web UI).

- **Website:** https://grow-fast-ten.vercel.app
- **Container ID:** set via `NEXT_PUBLIC_GTM_ID` in `.env.local` (never hardcoded)

---

## App-side wiring (already implemented)

| File | Role |
|---|---|
| `src/lib/gtm.ts` | `GTM_ID` constant, `pageview(url)`, generic `sendGTMEvent(event)` → safe `window.dataLayer.push` |
| `src/types/gtm.d.ts` | Augments `Window` with `dataLayer: Record<string, unknown>[]` |
| `src/app/layout.tsx` | Loads the GTM snippet (`next/script`, `afterInteractive`) + `<noscript>` iframe; wraps app in `GTMProvider` |
| `src/shared/analytics/GTMProvider.tsx` | `"use client"` — fires a `pageview` on every route change (`usePathname` + `useSearchParams`, isolated in `<Suspense>`) |
| `src/shared/analytics/GTMEventButton.tsx` | Reference example of a custom `button_click` event |
| `src/app/global-error.tsx` | Re-injects GTM on fatal crashes (root layout is bypassed) and pushes an `exception` event |

### Events pushed to the dataLayer

| `event` | Fields | Fired when |
|---|---|---|
| `pageview` | `page`, `page_path`, `page_location`, `page_title` | Initial load + every SPA route change |
| `button_click` | `label`, `location` | Example interaction (extend for real CTAs) |
| `exception` | `description`, `digest`, `fatal` | Uncaught error hits `global-error.tsx` |

> GTM's own `gtm.js` event also fires on container load.

### Local setup

```bash
# client/.env.local
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Restart the dev server after changing env. When `NEXT_PUBLIC_GTM_ID` is empty,
the snippet does not render (no broken container in dev/preview).

---

## GTM-side configuration (GTM web UI)

### 1. Data Layer Variables
**Variables → New → Data Layer Variable** — one per field:

| Variable Name | Data Layer Variable Name |
|---|---|
| `DLV - page_path` | `page_path` |
| `DLV - page_location` | `page_location` |
| `DLV - page_title` | `page_title` |
| `DLV - label` | `label` |
| `DLV - location` | `location` |
| `DLV - description` | `description` |
| `DLV - digest` | `digest` |
| `DLV - fatal` | `fatal` |

Also enable the built-in **Page Path / Page URL** variables (Variables → Configure).

### 2. Triggers
**Triggers → New → Custom Event** (matches the `event` key):

| Trigger Name | Type | Event name |
|---|---|---|
| `CE - pageview` | Custom Event | `pageview` |
| `CE - button_click` | Custom Event | `button_click` |
| `CE - exception` | Custom Event | `exception` |

> Don't use the built-in "History Change" trigger — the app fires an explicit
> `pageview` on every route change, so the Custom Event trigger is more reliable.

### 3. Tags (GA4 example)

**A. GA4 Configuration**
- Type: **Google Analytics: GA4 Configuration**
- Measurement ID: `G-XXXXXXX`
- Trigger: **Initialization - All Pages**
- Uncheck *Send a page view event* (pageviews are sent manually below so SPA navs are captured).

**B. GA4 Event — page_view**
- Type: **GA4 Event**, Configuration tag: (A)
- Event Name: `page_view`
- Parameters: `page_location` → `{{DLV - page_location}}`, `page_path` → `{{DLV - page_path}}`, `page_title` → `{{DLV - page_title}}`
- Trigger: `CE - pageview`

**C. GA4 Event — button_click**
- Event Name: `button_click`
- Parameters: `label` → `{{DLV - label}}`, `location` → `{{DLV - location}}`
- Trigger: `CE - button_click`

**D. GA4 Event — exception**
- Event Name: `exception`
- Parameters: `description` → `{{DLV - description}}`, `fatal` → `{{DLV - fatal}}`, `digest` → `{{DLV - digest}}`
- Trigger: `CE - exception`

### 4. Verify
1. GTM **Preview** → enter `https://grow-fast-ten.vercel.app`.
2. Navigate between routes — a `pageview` fires each time and the GA4 page_view tag shows "Fired."
3. Click a wired button — confirm `button_click`.
4. **Submit** the container.

---

## Adding new custom events

```ts
import { sendGTMEvent } from "@/lib/gtm";

sendGTMEvent({ event: "lead_created", source: "whatsapp", value: 1 });
```

Then add a matching **Custom Event** trigger (`lead_created`) and a GA4 Event tag in GTM.
