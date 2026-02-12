

## Problem Diagnosis

The push notification activation is failing because of **missing configuration**:

1. **No VAPID keys configured** -- The code reads `VITE_VAPID_PUBLIC_KEY` from environment variables, but this variable doesn't exist in the project. Without it, the subscription to web push fails with "Configuracao de notificacoes incompleta".

2. **No backend secrets configured** -- The edge function `send-push-notification` expects `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `FCM_SERVER_KEY` secrets, but none of these are configured (only `LOVABLE_API_KEY` exists).

3. **The `navigateFallbackDenylist` for `/~oauth` is missing** in the PWA config (minor but important for auth).

## Solution

### Step 1: Generate VAPID keys

VAPID keys are needed for Web Push. I will create a helper edge function to generate and return a VAPID key pair, OR we can use a simpler approach: generate them externally and store as secrets.

Since generating VAPID keys in Deno edge functions is complex, the simplest approach is:
- Use an online VAPID key generator (e.g., https://vapidkeys.com/) or run `npx web-push generate-vapid-keys` locally.
- Store the private key as a backend secret (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).

I will ask you for the VAPID key pair values to store as secrets.

### Step 2: Store secrets

Store these backend secrets:
- `VAPID_PUBLIC_KEY` -- used by both frontend and edge function
- `VAPID_PRIVATE_KEY` -- used by edge function only

### Step 3: Make the public key available to the frontend

Since `VITE_VAPID_PUBLIC_KEY` cannot be set in the `.env` file (auto-managed), I will hardcode the VAPID public key directly in the code (it is a **public** key, safe to embed in client code).

### Step 4: Fix the PWA config

Add `/~oauth` to `navigateFallbackDenylist` in `vite.config.ts` to prevent service worker from intercepting OAuth redirects.

### Step 5: Fix the web push sending in edge function

The current `sendWebPush` function is a stub that always returns `false`. It needs a real implementation using the Web Push protocol. I will implement it using Deno-compatible crypto APIs for VAPID signing.

---

## Technical Details

### Files to modify:
- `src/hooks/usePushNotifications.tsx` -- Replace env variable with hardcoded public key (after you provide it)
- `vite.config.ts` -- Add `navigateFallbackDenylist: [/^\/~oauth/]`
- `supabase/functions/send-push-notification/index.ts` -- Implement actual web push sending

### Files to create:
- None

### Secrets to configure:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### User action required:
- Generate VAPID keys (I will guide you through this)

