# Backend Implementation Notes (Frontend Handoff)

Last updated: 2026-03-01

This note captures backend work required to match the current frontend implementation.

## 1) Profile Settings: Delete Account Flow

Frontend behavior:
- Route: `/(tabs)/settings`
- UI: `Delete Account` button at bottom, with confirm dialog (`Are you sure?`)
- On confirm: client currently signs out to onboarding in preview mode

Backend requirements:
1. Implement `DELETE /api/me`.
2. Invalidate active access/refresh tokens immediately after acceptance.
3. Return idempotent success for repeated requests.
4. Optional async deletion worker is acceptable (`202 Accepted` + timestamp).

Suggested response:
```json
{
  "accepted": true,
  "deletionRequestedAt": "2026-03-01T18:25:00Z"
}
```

## 2) Notification Presets + Delivery Flow + Time Sheet

Frontend behavior:
- Route: `/(tabs)/notification-settings`
- Client now stores:
  - `preset`: `minimal | balanced | all`
  - `deliveryFlow`: `instant | batch_30m | hourly_digest`
  - `timeSheet`: `preset`, `quietStart`, `quietEnd`, `activeDays`
  - granular `settings` toggles by category key

Backend requirements:
1. Implement `GET /api/me/notifications` returning full preference envelope.
2. Implement `PATCH /api/me/notifications` with full object write semantics.
3. Validate enums and required notification keys.
4. Return canonical saved payload + `updatedAt`.

Suggested validation rules:
- `quietStart` and `quietEnd`: `HH:mm` 24-hour format
- `activeDays`: subset of `Mon..Sun`
- all `settings` keys required booleans

## 3) Data Model Suggestions

Suggested storage model:
```ts
type NotificationPrefs = {
  userId: string;
  preset: "minimal" | "balanced" | "all";
  deliveryFlow: "instant" | "batch_30m" | "hourly_digest";
  timeSheet: {
    preset: "off" | "night" | "day" | "focus";
    quietStart: string; // HH:mm
    quietEnd: string;   // HH:mm
    activeDays: string[]; // Mon..Sun
  };
  settings: {
    friendRequests: boolean;
    groupInvites: boolean;
    messages: boolean;
    friendActivity: boolean;
    friendOnline: boolean;
    matchmaking: boolean;
    achievements: boolean;
  };
  updatedAt: string;
};
```

## 4) Rollout Plan

1. Ship read path first:
- `GET /api/me/notifications`

2. Ship write path:
- `PATCH /api/me/notifications`

3. Ship account deletion:
- `DELETE /api/me`

4. Enable frontend API wiring and remove preview-only delete fallback.

## 5) QA Handshake

Backend QA should confirm:
1. Notification state round-trip works with all enums and day combinations.
2. Invalid payloads return contract-shaped `400` errors.
3. Delete account invalidates tokens and blocks future authenticated requests.
4. Repeated delete call remains idempotent and safe.

Reference contracts:
- `docs/FLOWS_BACKEND.md`
- `docs/BUILD_STATUS.md`
