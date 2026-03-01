# Screen Navigation Flows (Expo Router)

This document describes the current, route-based navigation in the Expo app and the expected back behavior.

## Back Behavior Rule (Global)

All in-app back buttons use `useSafeBackNavigation()` from `src/lib/navigation.ts`.

Behavior:
1. Try `goBack()` on current navigator.
2. If unavailable, walk parent navigators and go back on the first one that can.
3. Only if no navigator can go back, route to route-aware fallback by pathname:
- settings children -> `/(tabs)/settings`
- settings root -> `/(tabs)/profile`
- group children -> `/(tabs)/groups`
- social children -> `/(tabs)/social`
- profile children -> `/(tabs)/profile`
- feed/search/video children -> `/(tabs)/news`

This ensures the user returns to the previous page instead of hard-jumping to home in normal flows.

## Top-Level Routing

- `app/index.tsx` -> redirects to `/(tabs)/news`
- `app/onboarding.tsx` -> onboarding flow, completes into `/(tabs)/news`
- `app/(tabs)/_layout.tsx` -> tab shell + hidden stack-like tab routes

Main tabs:
- `/(tabs)/news` (Feed)
- `/(tabs)/groups`
- `/(tabs)/social`
- `/(tabs)/profile`

## Feed Flow

Entry:
- `/(tabs)/news`

Primary interactions:
- Vertical paged feed (single-item snap)
- Like / comment / more actions on right rail
- Share/report/save from action sheet

Comments flow:
- Tap comment icon -> opens in-place comments drawer
- Drawer supports vertical scroll + inline reply composer
- Reply send appends to local thread and updates displayed reply count
- Dismiss by tapping scrim or system back

Related routes:
- `/(tabs)/messages` (opened by share-to-friends flow)
- `/(tabs)/qr-code` (from header actions on other tabs)
- `/(tabs)/ai-advisor` (search/recommendation surface from feed header search icon)

Feed video-search flow:
1. Tap feed header search icon.
2. Route to `/(tabs)/ai-advisor`.
3. Render loading/error/empty/result states with fixed search bar.
4. Results are ranked as top 2 AI picks + top 8 query-ranked videos.
5. Render 2-column vertical infinite grid by repeating top 10 ranking pages.
6. Tap result card -> `/(tabs)/video-preview` with video params.
7. Back returns to feed context via safe back helper.

## Groups Flow

Entry:
- `/(tabs)/groups`

Routes:
- `/(tabs)/create-group`
- `/(tabs)/discover-groups`
- `/(tabs)/group-detail?groupId=...`
- `/(tabs)/messages` (group sharing/chat handoff)
- `/(tabs)/settings` (global settings)

Group swiper flow:
1. Tap card icon next to Create in Groups header.
2. Open Group Swipe modal.
3. Swipe current card:
- Right swipe -> join current group -> advance to next card.
- Left swipe -> pass current group -> advance to next card.
4. Side-screen intent feedback while dragging:
- Right side glow = green.
- Left side glow = red.
5. Button fallback remains available for non-gesture users (Join/Pass).
6. Joined groups are removed from discover list in-session.

Group detail flow:
1. Open group card -> `/(tabs)/group-detail?groupId=...`.
2. Tab sections are `Home`, `Events`, `Chat`, `Members`.
3. Group settings menu includes `Notifications`, `Share`, `Report`, and `Leave group` at bottom.
4. Back returns to the previous route context.

Expected back behavior:
- Create/discover/detail return to the previous screen in the real stack path.

## Social Flow

Entry:
- `/(tabs)/social`

Routes:
- `/(tabs)/search-players`
- `/(tabs)/chat?userId=...`
- `/(tabs)/user-profile?userId=...`
- `/(tabs)/qr-code`

Expected back behavior:
- Search/chat/user-profile return to origin screen (social/messages/user-profile).

## Profile Flow

Entry:
- `/(tabs)/profile`

Header routes:
- `/(tabs)/qr-code`
- `/(tabs)/settings`
- `/(tabs)/edit-profile`

Collection tabs in profile section:
- `Videos`
- `Games`
- `Groups`

Profile collection creation routes:
- Videos add / upload -> `/(tabs)/create-collection?type=video`
- Games add -> `/(tabs)/create-collection?type=game`
- Groups add -> `/(tabs)/create-group`

Video preview route:
- Tap video card -> `/(tabs)/video-preview` with params (`title`, `image`, `duration`, `views`)

Status flow:
- Tap status row (`Online · Ready to play`, etc.) -> status ActionSheet
- Pick status -> profile dot/text update immediately

Collection flow:
1. Videos/Games/Groups each have an add-first tile entry.
2. Add flow routes to create collection/group screen.
3. Saved profile collections persist through local cache hook.

## Settings and Account Flow

Entry:
- `/(tabs)/settings`

Routes:
- `/(tabs)/account-settings`
- `/(tabs)/notification-settings`
- `/(tabs)/platform-connections`
- `/(tabs)/privacy-settings`
- `/(tabs)/privacy-detail`
- `/(tabs)/help`
- `/(tabs)/explore`

Expected back behavior:
- All settings sub-pages return to previous settings context via safe back helper.

## Hidden/Utility Routes

Registered in tab layout with `href: null`:
- `index`, `explore`, `account-settings`, `ai-advisor`, `chat`, `create-group`,
  `create-collection`, `discover-groups`, `edit-profile`, `group-detail`, `help`,
  `matchmaking`, `messages`, `notification-settings`, `notifications`, `platform-connections`,
  `privacy-detail`, `privacy-settings`, `qr-code`, `search-players`, `settings`, `user-profile`,
  `video-preview`.

These are reachable by programmatic navigation and preserve tab shell context.
