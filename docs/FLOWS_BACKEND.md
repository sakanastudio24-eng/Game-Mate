# Backend API Integration Reference

Complete documentation of all API endpoints needed for GameMate Phase B+ backend integration.

---

## Authentication & User Management

**POST /api/auth/signup**

- Request: `{ email, password, birthdate, preferredGenres[], playStyle }`
- Response: `{ userId, token, user: {...} }`
- Used by: OnboardingPreferences → create account

**POST /api/auth/login**

- Request: `{ email, password }`
- Response: `{ userId, token, user: {...} }`
- Used by: WelcomeScreen → email login

**POST /api/auth/social-login**

- Request: `{ provider: 'google'|'steam'|'psn'|'xbox', token }`
- Response: `{ userId, token, user: {...} }`
- Used by: WelcomeScreen → social auth buttons

**GET /api/me**

- Response: `{ id, email, username, avatar, stats: {...}, games[], privacySettings, ... }`
- Used by: ProfileScreen load, profile edits

**PATCH /api/me**

- Request: `{ username?, bio?, avatar?, games[]?, ... }`
- Response: Updated user object
- Used by: EditProfileScreen → submit

**PATCH /api/me/privacy**

- Request: `{ profilePublic?, showOnlineStatus?, allowMessages?, allowGroupInvites?, searchable? }`
- Response: Updated privacy settings
- Used by: PrivacySettingsScreen

**PATCH /api/me/notifications**

- Request: `{ friendRequests?, groupInvites?, messages?, achievements?, ... }`
- Response: Updated notification settings
- Used by: NotificationSettingsScreen

---

## Posts / Feed

**GET /api/posts**

- Query: `?category=fyp|esports|patches|streams&limit=20&offset=0`
- Response: `{ posts: [{ id, author, game, content, likes, saves, comments, ... }], hasMore }`
- Used by: NewsScreen load & scroll

**POST /api/posts/:id/like**

- Response: `{ liked: boolean, likeCount }`
- Used by: NewsScreen → heart icon

**POST /api/posts/:id/save**

- Response: `{ saved: boolean, saveCount }`
- Used by: NewsScreen → bookmark icon

---

## Groups & Matchmaking

**GET /api/groups**

- Query: `?mode=ranked|casual&limit=20&offset=0`
- Response: `{ groups: [{ id, game, name, players, mode, rank, ... }], hasMore }`
- Used by: GroupsScreen load

**POST /api/groups**

- Request: `{ game, name, description, mode, minRank, maxRank, requireMic, maxPlayers }`
- Response: Full group object
- Used by: CreateGroupScreen → form submit

**GET /api/groups/discover**

- Query: `?game=?&mode=?&rank=?&region=?&limit=20&offset=0`
- Response: `{ groups: [...] }`
- Used by: DiscoverGroupsScreen

**GET /api/groups/:id**

- Response: Full group object with `{ members: [...], chat: [...], events: [...] }`
- Used by: GroupDetailScreen

**POST /api/groups/:id/join**

- Response: `{ joined: boolean, memberCount }`
- Used by: GroupDetailScreen → join button

**POST /api/groups/:id/leave**

- Response: `{ joined: boolean, memberCount }`
- Used by: GroupDetailScreen → leave button

**POST /api/groups/:id/chat**

- Request: `{ message, attachments?: [] }`
- Response: Message object
- Used by: GroupDetailScreen chat input

**GET /api/matchmaking/suggestions**

- Query: `?game=?&mode=?&rank=?&region=?&limit=10`
- Response: `{ matches: [{ groupId, game, players, avgRank, trustScore, ... }] }`
- Used by: MatchmakingScreen

---

## Friends & Social

**GET /api/friends**

- Query: `?status=online|offline|all`
- Response: `{ friends: [{ id, username, status, game, avatar, ... }], hasMore }`
- Used by: SocialScreen friends tab

**GET /api/friends/requests**

- Response: `{ incomingRequests: [...], outgoingRequests: [...], suggestedFriends: [...] }`
- Used by: SocialScreen requests tab

**POST /api/friends/request/:userId**

- Response: `{ requested: boolean }`
- Used by: SearchPlayersScreen → add button

**POST /api/friends/accept/:userId**

- Response: `{ requested: boolean }`
- Used by: SocialScreen requests tab → accept button

**POST /api/friends/reject/:userId**

- Response: Success message
- Used by: SocialScreen requests tab → reject button

**GET /api/players/search**

- Query: `?query=name&games=?&rank=?&limit=20&offset=0`
- Response: `{ players: [{ id, name, rank, games, onlineStatus, mutualFriends, ... }] }`
- Used by: SearchPlayersScreen search

**GET /api/users/:userId**

- Response: User profile object
- Used by: UserProfileScreen load

---

## Direct Messages

**GET /api/messages/conversations**

- Response: `{ conversations: [{ userId, lastMessage, unreadCount, timestamp, ... }] }`
- Used by: MessagesScreen load

**GET /api/messages/:userId**

- Query: `?limit=50&offset=0`
- Response: `{ messages: [{ id, sender, text, timestamp, ... }], hasMore }`
- Used by: ChatScreen load

**POST /api/messages/:userId**

- Request: `{ message, attachments?: [] }`
- Response: Message object
- Used by: ChatScreen → send button

---

## Notifications

**GET /api/notifications**

- Response: `{ notifications: [{ id, type, title, description, timestamp, read, ... }] }`
- Used by: NotificationsScreen load

**POST /api/notifications/:id/read**

- Response: Success message
- Used by: NotificationsScreen

**DELETE /api/notifications/:id**

- Response: Success message
- Used by: NotificationsScreen dismiss

---

## QR Code

**GET /api/qr/my-code**

- Response: `{ qrCodeUrl, customColor, shareUrl, ... }`
- Used by: QRCodeScreen mycode tab

**PATCH /api/qr/my-code**

- Request: `{ customColor }`
- Response: Updated QR data
- Used by: QRCodeScreen → color picker

**GET /api/qr/scan**

- Query: `?code=<scannedCode>`
- Response: `{ userId, user: {...} }`
- Used by: QRCodeScreen scan tab

---

## Settings & Account

**POST /api/users/password/change**

- Request: `{ currentPassword, newPassword }`
- Response: Success message
- Used by: AccountSettingsScreen

**POST /api/users/email/send-verify**

- Request: `{ newEmail }`
- Response: `{ codeSent: boolean }`
- Used by: AccountSettingsScreen

**POST /api/users/phone/verify**

- Request: `{ phoneNumber, countryCode }`
- Response: `{ codeSent: boolean }`
- Used by: AccountSettingsScreen

---

## Error Handling

All endpoints return:

- `200 OK` — Success
- `201 Created` — Resource created
- `400 Bad Request` — Invalid fields
- `401 Unauthorized` — Auth failed
- `403 Forbidden` — No permission
- `404 Not Found` — Resource doesn't exist
- `409 Conflict` — Already exists/taken
- `500 Server Error` — Backend error

Error response format: `{ error: string, code: string, details?: {...} }`

---

## Real-Time Features (Phase C+)

- WebSocket for group chat messages
- WebSocket for friend online status
- WebSocket for notifications
- Server-sent events for feed updates
