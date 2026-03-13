# GameMate Caching Strategy

## Purpose

This document defines the caching strategy for GameMate.

The goal of caching in GameMate is to:

- reduce repeated expensive queries
- improve app responsiveness
- reduce backend stress during repeated reads
- keep feed and social surfaces fast
- establish good architecture habits before InkVein

This document is not just a performance note.
It is a system clarity document.

Caching must remain:

- understandable
- intentional
- invalidatable
- non-destructive
- secondary to source-of-truth data

## Core Rule

The database is the source of truth.

Caching is only a temporary speed layer.

If cache disappears, the app must still work correctly.

Cache should improve:

- speed
- server load
- repeated access patterns

Cache should never become:

- a hidden source of truth
- a permission shortcut
- a silent logic layer that is hard to reason about

## Storage Layers

GameMate should use two caching/storage patterns:

### 1. Redis-style temporary cache

Use for:

- hot reads
- repeated computed responses
- unread counts
- feed pages
- rate limiting
- short-lived social counters

### 2. Postgres durable summary tables

Use for:

- daily rollups
- historical summaries
- analytics snapshots
- future reporting
- anything that should survive restart and be inspectable

For GameMate now, most true caching should be thought of as Redis-first, even if not fully implemented yet.

## Cache Design Rules

### Rule 1

Cache reads, not writes.

### Rule 2

Invalidate on writes.

### Rule 3

Prefer deleting stale cache and rebuilding it over trying to mutate cache in clever ways.

### Rule 4

Do not cache private/permission-sensitive surfaces unless invalidation is extremely clear.

### Rule 5

Short TTLs are safer than long TTLs.

### Rule 6

Cache keys must be readable and namespaced.

Example:

`feed:user:42:page:1`
`notif:user:42:unread`
`profile:user:42:stats`
`group:19:members`

## Cache Inventory

### 1. Feed Cache

**Surface**

Personalized feed

**Key Pattern**

`feed:user:{user_id}:page:{page_number}`

**Storage Layer**

Redis

**What Is Cached**

- ranked post IDs
- lightweight feed metadata if needed
- optionally cursor/page marker data

**Why Cache It**

Feed generation is one of the most expensive read paths because it combines:

- posts
- interactions
- profile interests
- friend relationships
- recency
- diversity logic
- explainability metadata

Users also reopen the feed frequently, making repeated recalculation wasteful.

**TTL**

30 to 120 seconds

**Invalidate When**

- user creates a post
- user deletes/restores a post
- user likes/shares/skips content
- friend creates a post
- profile interests change
- friend graph changes

**Risk If Stale**

Medium

**Notes**

Keep feed cache short-lived.
Feed is important enough that it should feel fresh.

### 2. Feed Explain Cache

**Surface**

"Why am I seeing this?" / explain endpoint

**Key Pattern**

`feed_explain:user:{user_id}:post:{post_id}`

**Storage Layer**

Redis

**What Is Cached**

- explain reasons
- score breakdown summary
- lightweight signal details

**Why Cache It**

Explain calculations may reuse the same ranking logic repeatedly for the same post/user combination.

**TTL**

30 to 120 seconds

**Invalidate When**

- feed score inputs change
- profile interests change
- social graph changes
- interaction counts change significantly

**Risk If Stale**

Low to Medium

**Notes**

This is helpful but not required before feed cache is working.

### 3. Profile Stats Cache

**Surface**

Profile page summary stats

**Key Pattern**

`profile:user:{user_id}:stats`

**Storage Layer**

Redis

**What Is Cached**

- post count
- friends count
- groups count
- optional message thread count later

**Why Cache It**

These counts often require repeated joins or aggregate queries and are read frequently.

**TTL**

1 to 10 minutes

**Invalidate When**

- post created/deleted/restored
- friend added/removed
- group joined/left
- group ownership or membership changes if reflected in stats

**Risk If Stale**

Low

**Notes**

Do not cache the entire profile object initially.
Cache only lightweight derived stats.

### 4. Profile Posts Cache

**Surface**

Posts shown on a profile

**Key Pattern**

`profile:user:{user_id}:posts:page:{page_number}`

**Storage Layer**

Redis

**What Is Cached**

- profile post IDs
- page slices of profile timeline

**Why Cache It**

Profile post lists are re-opened often and may become expensive with pagination and future sorting.

**TTL**

30 to 300 seconds

**Invalidate When**

- user creates a post
- user deletes/restores a post
- profile visibility changes if relevant later

**Risk If Stale**

Low to Medium

**Notes**

Simple and useful if profile browsing becomes common.

### 5. Notification Unread Count Cache

**Surface**

Unread notification badge

**Key Pattern**

`notif:user:{user_id}:unread`

**Storage Layer**

Redis

**What Is Cached**

unread notification count only

**Why Cache It**

This value is small but requested frequently across navigation and app startup.

**TTL**

30 to 60 seconds or write-through update

**Invalidate When**

- notification created
- notification marked read
- all notifications marked read

**Risk If Stale**

Low

**Notes**

This is one of the best low-risk caches in the app.

### 6. Notification List Cache

**Surface**

Notification screen list

**Key Pattern**

`notif:user:{user_id}:list:page:{page_number}`

**Storage Layer**

Redis

**What Is Cached**

- recent notification IDs
- page slices of notification feed

**Why Cache It**

Notifications are re-opened often and follow a high-read, lower-computation pattern.

**TTL**

30 to 120 seconds

**Invalidate When**

- new notification created
- notifications marked read
- notification deleted if that exists later

**Risk If Stale**

Low

**Notes**

Optional. Unread badge count is higher priority.

### 7. Friend List Cache

**Surface**

Friends list

**Key Pattern**

`friends:user:{user_id}:list`

**Storage Layer**

Redis

**What Is Cached**

- friend user IDs
- maybe lightweight username/avatar summaries later

**Why Cache It**

Friends data is used in multiple places:

- friend screen
- feed boost logic
- share flows
- message thread creation

**TTL**

1 to 10 minutes

**Invalidate When**

- friend request accepted
- friend removed
- block/mute systems added later

**Risk If Stale**

Low to Medium

**Notes**

This cache becomes more useful as social features expand.

### 8. Friend Request List Cache

**Surface**

Pending friend requests

**Key Pattern**

`friend_requests:user:{user_id}:incoming`
`friend_requests:user:{user_id}:outgoing`

**Storage Layer**

Redis

**What Is Cached**

- pending request IDs
- sender/receiver IDs

**Why Cache It**

Friend requests are checked often in social flows and notification-driven screens.

**TTL**

30 to 120 seconds

**Invalidate When**

- request sent
- request accepted
- request rejected/cancelled

**Risk If Stale**

Low

**Notes**

Useful, but lower priority than feed and unread counts.

### 9. Group Members Cache

**Surface**

Group members list

**Key Pattern**

`group:{group_id}:members`

**Storage Layer**

Redis

**What Is Cached**

- member user IDs
- possibly lightweight role/member metadata

**Why Cache It**

Member lists are common reads and can be reused in:

- group detail page
- invite logic
- promote logic
- owner-only actions

**TTL**

1 to 10 minutes

**Invalidate When**

- member joins
- member leaves
- invite accepted
- member promoted/demoted
- group deleted or soft-hidden

**Risk If Stale**

Medium

**Notes**

Important not to cache permissions loosely without clear invalidation.

### 10. Group Summary Cache

**Surface**

Group detail summary

**Key Pattern**

`group:{group_id}:summary`

**Storage Layer**

Redis

**What Is Cached**

- group name
- description
- privacy state
- member count
- owner summary

**Why Cache It**

Group pages may be opened repeatedly and have lightweight summary data.

**TTL**

1 to 10 minutes

**Invalidate When**

- group updated
- membership count changes
- owner changes
- privacy changes

**Risk If Stale**

Low to Medium

**Notes**

Useful if group detail becomes a high-traffic screen.

### 11. Group List Cache

**Surface**

Public or user-visible group list

**Key Pattern**

`groups:list:public:page:{page_number}`
`groups:list:user:{user_id}:page:{page_number}`

**Storage Layer**

Redis

**What Is Cached**

- visible group IDs
- page slices of group discovery

**Why Cache It**

Group discovery is a read-heavy surface and tends to be repeatedly queried.

**TTL**

30 to 300 seconds

**Invalidate When**

- new group created
- group visibility changes
- group deleted/hidden
- group metadata significantly changed

**Risk If Stale**

Medium

**Notes**

Useful for browse/discover pages.

### 12. Message Thread List Cache

**Surface**

Conversation list / inbox

**Key Pattern**

`messages:user:{user_id}:threads`

**Storage Layer**

Redis

**What Is Cached**

- thread IDs
- thread ordering
- unread counts per thread if desired later

**Why Cache It**

Inbox lists are opened frequently and often include aggregate data.

**TTL**

30 to 120 seconds

**Invalidate When**

- new thread created
- new message sent
- thread read state changes

**Risk If Stale**

Medium

**Notes**

Useful once messaging becomes heavily used.

### 13. Message Unread Count Cache

**Surface**

Unread message badge

**Key Pattern**

`messages:user:{user_id}:unread`

**Storage Layer**

Redis

**What Is Cached**

unread message count

**Why Cache It**

Frequently requested in app nav and top-level UI.

**TTL**

30 to 60 seconds or write-through update

**Invalidate When**

- message received
- thread opened/read
- thread muted if that exists later

**Risk If Stale**

Low

**Notes**

High-value, low-risk cache.

### 14. Post Interaction Count Cache

**Surface**

Post-level counts

**Key Pattern**

`post:{post_id}:counts`

**Storage Layer**

Redis

**What Is Cached**

- like count
- share count
- comment count
- skip count if shown internally only

**Why Cache It**

Counts are used repeatedly in feeds and detail pages.

**TTL**

30 to 120 seconds

**Invalidate When**

- like/share/comment/skip created or removed
- post deleted/restored

**Risk If Stale**

Low to Medium

**Notes**

Can reduce repeated aggregation on hot posts.

### 15. Hot Post Cache

**Surface**

Trending or popular post candidates

**Key Pattern**

`posts:hot`
`posts:hot:{game}`

**Storage Layer**

Redis

**What Is Cached**

- hot post IDs
- trending candidate pool

**Why Cache It**

Useful for feed candidate generation and future explore views.

**TTL**

1 to 10 minutes

**Invalidate When**

- interaction counts shift significantly
- scheduled refresh job runs
- post deleted/restored

**Risk If Stale**

Medium

**Notes**

This is more useful once the user base grows.

### 16. Game Interest Candidate Cache

**Surface**

Game-specific candidate pools

**Key Pattern**

`posts:game:{game_slug}:recent`
`posts:game:{game_slug}:hot`

**Storage Layer**

Redis

**What Is Cached**

- post IDs grouped by game
- feed candidate pools for interest ranking

**Why Cache It**

Your feed uses game interests, so pre-grouped candidate pools reduce scoring cost.

**TTL**

1 to 10 minutes

**Invalidate When**

- new post for game
- post deleted/restored
- scheduled ranking refresh

**Risk If Stale**

Low to Medium

**Notes**

Useful for scaling the feed without recalculating everything from scratch.

### 17. Rate Limiting Cache

**Surface**

Abuse protection

**Key Pattern**

`ratelimit:user:{user_id}:{event_type}`
`ratelimit:ip:{ip}:{event_type}`

**Storage Layer**

Redis

**What Is Cached**

temporary counters / timestamps

**Why Cache It**

This is the correct place for rate limiting.

**TTL**

Based on event window:

- 10 seconds
- 60 seconds
- 5 minutes
- etc.

**Invalidate When**

TTL expires naturally

**Risk If Stale**

Low

**Notes**

Critical for spam prevention and system protection.

### 18. Event Deduplication Cache

**Surface**

Signals and background jobs

**Key Pattern**

`eventdedupe:{event_type}:{object_id}:{user_id}`

**Storage Layer**

Redis

**What Is Cached**

temporary marker preventing duplicate processing

**Why Cache It**

Avoid duplicate notifications, repeated signal firing, or duplicate async task work.

**TTL**

30 seconds to 5 minutes depending on event type

**Invalidate When**

TTL expires naturally

**Risk If Stale**

Low

**Notes**

Useful for event-driven architecture stability.

### 19. Search Suggestion Cache

**Surface**

User/group/post search suggestions

**Key Pattern**

`search:users:{query}`
`search:groups:{query}`
`search:posts:{query}`

**Storage Layer**

Redis

**What Is Cached**

- suggestion result IDs
- lightweight suggestion payloads

**Why Cache It**

Search suggestions are repetitive and benefit from short-lived caching.

**TTL**

30 to 300 seconds

**Invalidate When**

- user/group/post created or renamed
- TTL naturally expires

**Risk If Stale**

Low

**Notes**

Optional early, useful later.

### 20. App Bootstrap Cache

**Surface**

Initial home/app hydration summary

**Key Pattern**

`bootstrap:user:{user_id}`

**Storage Layer**

Redis

**What Is Cached**

- profile summary
- unread counts
- maybe friend count
- maybe quick-start app state

**Why Cache It**

Speeds up initial app open.

**TTL**

30 to 120 seconds

**Invalidate When**

- profile changes
- notifications change
- friend state changes

**Risk If Stale**

Low to Medium

**Notes**

A good later optimization, not an immediate must-have.

## Durable Summary Tables (Not Temporary Cache)

These are not Redis-style cache.
These are durable computed summaries that belong in Postgres.

### 21. Daily User Stats Snapshot

**Table**

`user_stats_daily`

**Stores**

- user_id
- date
- post_count
- received_interactions
- sent_interactions
- friend_count snapshot

**Why**

Useful for analytics and future profile/history views.

**Refresh Style**

Scheduled job

### 22. Daily Group Stats Snapshot

**Table**

`group_stats_daily`

**Stores**

- group_id
- date
- member_count
- activity_count
- invite count
- join/leave movement

**Why**

Helps understand group health later.

**Refresh Style**

Scheduled job

### 23. Feed Analytics Snapshot

**Table**

`feed_metrics_daily`

**Stores**

- date
- total feed requests
- average response time
- average cache hit rate
- top games
- top interaction types

**Why**

Operational review and later optimization.

**Refresh Style**

Scheduled job

## Invalidation Policy

### General Rule

When data changes, delete affected cache keys.

Do not try to manually keep everything in sync unless absolutely necessary.

### Examples

**User updates profile interests**

Delete:

- `feed:user:{id}:*`
- `profile:user:{id}:stats`
- `bootstrap:user:{id}`

**User creates post**

Delete:

- `feed:user:{author_id}:*`
- `posts:game:{game_slug}:recent`
- `posts:game:{game_slug}:hot`
- `profile:user:{author_id}:posts:*`
- `profile:user:{author_id}:stats`
- `posts:hot`

**Friend request accepted**

Delete:

- `friends:user:{sender_id}:list`
- `friends:user:{receiver_id}:list`
- `profile:user:{sender_id}:stats`
- `profile:user:{receiver_id}:stats`
- `feed:user:{sender_id}:*`
- `feed:user:{receiver_id}:*`
- `bootstrap:user:{sender_id}`
- `bootstrap:user:{receiver_id}`

**Notification created**

Delete:

- `notif:user:{id}:unread`
- `notif:user:{id}:list:*`
- `bootstrap:user:{id}`

## Freshness / Trust Notes

Some surfaces can tolerate mild staleness.
Some should stay fresh.

### High freshness needed

- feed
- unread counts
- permissions-sensitive group state
- thread unread state

### Medium freshness acceptable

- profile stats
- group lists
- search suggestions
- trending candidate pools

### Low freshness risk

- daily summary tables
- analytics snapshots

GameMate can tolerate light staleness in non-critical views.
But user trust should always win over small speed gains.

## What Should Be Cached If Not On This List

If a surface is not listed above, use this test:

Cache it if all of these are true:

- it is read often
- it is expensive to compute or aggregate
- stale data for a short time is acceptable
- invalidation rules are clear
- it is not the source of truth
- it reduces noticeable app or server stress

Do NOT cache it if any of these are true:

- it contains sensitive permission state that changes often
- it is cheap to query already
- stale results would confuse users badly
- invalidation rules are unclear
- it is only used rarely
- caching would add more complexity than benefit

## Things That Should Usually Be Considered For Caching Later

If not already listed, evaluate these later as the app grows:

- public discover pages
- game-specific leaderboards
- top creators by period
- unread group activity counts
- recommended friends
- recommended groups
- onboarding recommendation pools
- profile suggestion cards
- event reminder counts
- moderation/admin dashboard summaries
- analytics dashboards
- future map/local discovery surfaces

## Final Principle

Caching in GameMate should always be:

- readable
- temporary
- invalidatable
- optional
- replaceable

The point is not to cache everything.

The point is to cache the right things for the right reasons.

That keeps the system fast without becoming confusing.
