# Frontend Handoff Checklist

Last updated: 2026-03-01

Use this as the release/handoff checklist for frontend scope before backend integration and QA passes.

## 1) App Foundation

- [x] Expo Router tab shell is stable (`Feed`, `Groups`, `Social`, `Profile`)
- [x] Hidden routes are registered and navigable through typed route pushes
- [x] Global `ToastProvider` is mounted in root layout
- [x] Safe-area responsive spacing applied for top/bottom controls
- [x] Android keyboard compatibility guard applied to text/search inputs

## 2) Navigation and Back Behavior

- [x] In-app back buttons use `useSafeBackNavigation()`
- [x] Parent navigator walkback works before fallback routing
- [x] Fallback routes are route-aware by pathname group
- [x] Group-detail/settings/chat/search flows return to prior route context

## 3) Onboarding

- [x] Step flow wired: Welcome -> Email -> Birthdate -> Preferences
- [x] Email gate exists
- [x] Birthdate input is strict `MMDDYYYY` (8 digits)
- [x] Birthdate must be valid calendar date
- [x] Birthdate must be strictly earlier than current day
- [x] Terms acceptance required before continue

## 4) Feed

- [x] Vertical paged feed with infinite loop append
- [x] Right-side action rail (like/comment/share/save/more)
- [x] Comment drawer with scrollable thread + reply composer
- [x] Optimistic like toggle + undo
- [x] Share/report/save menu options available
- [x] Feed search entry routes to video search screen

## 5) Search / Recommendations (`/(tabs)/ai-advisor`)

- [x] Top 2 AI picks + next 8 query-ranked results
- [x] Fixed search bar
- [x] 2-column vertical infinite list behavior
- [x] Video-first cards (thumbnail, duration, metadata, stats)
- [x] Debounced input + recent searches + autocomplete + filter chips
- [x] Loading, empty, and error states present
- [x] Result tap routes back to feed with focused video context

## 6) Groups

- [x] Discover list renders with consistent card model
- [x] Join flow is optimistic and undoable
- [x] Joined groups removed from discover surface
- [x] Group swipe modal supports:
  - [x] swipe right join
  - [x] swipe left pass
  - [x] green/red intent feedback
- [x] Group detail tabs: Home / Events / Chat / Members
- [x] Group settings action sheet includes Share / Report / Leave

## 7) Social and Messaging

- [x] Friends/messages/requests surfaces are navigable
- [x] Search bars and filtering available in social flows
- [x] Chat composer supports inline send and visible message metadata
- [x] User profile route handoff from social cards is working

## 8) Profile and Settings

- [x] Profile collection tabs (Videos / Games / Groups)
- [x] Add-first creation tiles present in each collection
- [x] Status picker updates immediately
- [x] Settings routes wired (account, privacy, notifications, platform connections)

## 9) Accessibility and UX Baselines

- [x] Key action buttons have accessibility labels
- [x] Minimum touch-target sizing strategy applied through responsive tokens
- [x] Reduce motion preference is respected in animated wrappers
- [x] Non-gesture alternatives exist for swipe actions (buttons)

## 10) Performance Baselines

- [x] Heavy list surfaces use `FlatList`
- [x] Virtualization settings applied on core list-heavy screens
- [x] Media-heavy cards use `expo-image` and cache policy
- [x] Core search/filter work is debounced + memoized
- [x] Heavy repeated card components memoized where implemented

## 11) Data, Cache, and Contracts

- [x] `useLocalCache` hook wired to AsyncStorage path with fallback
- [x] Recommendation contract aligned in `docs/AI_HANDOFF.md`
- [x] Backend endpoint inventory aligned in `docs/FLOWS_BACKEND.md`
- [x] Feed/video metadata contract includes category/hashtags/game/title/likes/comments/shares fields in docs

## 12) Known Constraints

- [x] Android is primary validated target for current pass
- [x] iOS is not fully tested due to limited capability
- [x] Expo Go overlay runtime caveat documented for Android testing

## 13) Final Handoff Deliverables

- [x] `README.md` updated
- [x] `docs/FLOWS.md` updated
- [x] `docs/MOBILE_WORKFLOW_NOTES.md` updated
- [x] `docs/FRONTEND_CHECKLIST_STATUS.md` updated
- [x] `docs/BUILD_STATUS.md` updated
