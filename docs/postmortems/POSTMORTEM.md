# GameMate Postmortem

This is the single running postmortem for recurring product and implementation failures found during the mobile/backend integration pass.

## 2026-03-05: Postman 401 on `/api/accounts/me/`

Symptom:
- protected endpoint returned `401` even though the tester believed they had a valid token

Root cause:
- bearer token was entered in request body instead of the `Authorization` header

Fix:
- use `Authorization: Bearer <access_token>` or Postman bearer auth

Rule:
- auth debugging starts with the exact transmitted header, not with guessing about token validity

## 2026-03-07: Phone Login `Network request failed`

Symptom:
- Expo app could reach Metro but not Django

Root cause:
- backend bound to loopback only and/or frontend pointed at `localhost` from a physical phone

Fix:
- run Django on `0.0.0.0:8000`
- point mobile frontend to `http://<LAN_IP>:8000`
- keep backend `ALLOWED_HOSTS` aligned with the LAN IP

Rule:
- Metro port and API port are different services; mobile devices must hit the backend through the host machine LAN IP

## 2026-03-08: Django app-label collision for `messages`

Symptom:
- migrations failed because `messages` collided with `django.contrib.messages`

Root cause:
- custom app label reused a Django built-in label

Fix:
- use an explicit unique app label

Rule:
- common Django app names need explicit label review before migration work

## 2026-03-13: Login 401 copy and back-navigation loop

Symptom:
- invalid credentials looked like session expiry
- back behavior could ping-pong between screens

Root cause:
- frontend mapped all `401` responses to the same message
- fallback navigation could re-add prior routes instead of exiting cleanly

Fix:
- distinguish login credential failure from authenticated-session expiry
- prefer stack pop and explicit fallback targets over history guesses

Rule:
- `401` handling is context-aware, and root back behavior must be explicit

## 2026-03-13: Onboarding data loss risk

Symptom:
- onboarding could lose user-entered progress after failure or relaunch

Root cause:
- onboarding behaved like a one-shot submit instead of durable draft state

Fix:
- local onboarding draft persistence
- clear draft only after successful final completion

Rule:
- interrupted onboarding must recover without forcing re-entry

## 2026-03-15: Android onboarding keyboard gap

Symptom:
- focusing onboarding inputs created a black bottom gap on Android

Root cause:
- Android keyboard avoidance resized the screen in a way that produced phantom footer space

Fix:
- disable the problematic Android keyboard-avoidance path on onboarding
- align nav/background colors with the screen

Rule:
- onboarding should not create phantom nav/footer gaps after input focus

## 2026-03-15: Settings and child-route back flow drift

Symptom:
- some nested settings or utility routes returned to feed instead of their real parent

Root cause:
- generic history fallback was used in routes where the parent was already known

Fix:
- use explicit return targets for settings, profile-edit, message, group-detail, and QR-related child flows

Rule:
- if a child route has a stable known parent, back should be explicit, not inferred
