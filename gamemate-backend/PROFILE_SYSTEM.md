# GameMate Profile System

## Purpose

The profile system stores user information and preferences used for:

* Personalization
* Feed relevance
* Basic social identity
* Future settings

GameMate profiles are intentionally **lightweight**. The goal is to support learning backend architecture while avoiding unnecessary complexity.

This system will later inform how InkVein profiles evolve.

---

# Profile Architecture

## Data Model

Each user has **one profile** linked to their account.

Relationship:

User
↓
Profile (1:1)

Example:

User
id: 1
username: dan

Profile
user_id: 1
favorite_games: ["Apex Legends", "Valorant"]

---

# Profile Fields

## Core Identity

| Field      | Type     | Purpose                    |
| ---------- | -------- | -------------------------- |
| username   | string   | display identity           |
| bio        | text     | optional description       |
| avatar_url | string   | profile image              |
| created_at | datetime | profile creation timestamp |

---

## Interest Preferences

Used by the **feed ranking system**.

| Field          | Type          | Purpose                        |
| -------------- | ------------- | ------------------------------ |
| favorite_games | array<string> | used for feed interest scoring |

Example:

```
favorite_games = [
"Apex Legends",
"Valorant",
"Rocket League"
]
```

Feed system example:

```
post.game == "Apex Legends"
user.favorite_games contains "Apex Legends"

score += interest_boost
```

Feed reason returned:

```
"game_interest"
```

---

# API Endpoints

## Get Current Profile

```
GET /api/profile/me
```

Response:

```
{
 "username": "dan",
 "bio": "FPS player",
 "avatar_url": "",
 "favorite_games": [
   "Apex Legends",
   "Valorant"
 ]
}
```

---

## Update Profile

```
PATCH /api/profile/me
```

Body example:

```
{
 "bio": "Competitive Apex player",
 "favorite_games": [
   "Apex Legends",
   "Valorant"
 ]
}
```

Allowed updates:

* bio
* avatar_url
* favorite_games

---

# Feed Integration

The feed service will read user preferences.

Example:

```
user.favorite_games = ["Apex Legends"]
post.game = "Apex Legends"

score += interest_weight
```

Feed metadata:

```
"reasons": [
 "recent",
 "game_interest"
]
```

---

# Validation Rules

Bio:

* max length: 300 characters

Favorite games:

* max: 10
* must be strings
* duplicates not allowed

Avatar URL:

* must be valid URL
* optional

---

# Security Rules

Profiles follow normal authentication rules.

Required:

* JWT authentication
* users can only modify their own profile
* public read allowed (optional)

Future privacy settings may restrict public access.

---

# Future Expansion

This profile structure is intentionally simple but expandable.

Possible future additions:

* preferred_roles
* skill_tags
* social_links
* visibility settings
* group reputation
* contribution metrics
* creative specialties

These should be added **without breaking the core profile model**.

---

# Design Philosophy

Profiles should remain:

* lightweight
* identity-focused
* preference-driven

They should **not become complex resumes**.

The goal is to support:

* discovery
* relevance
* collaboration

while keeping the system simple.

---

# Summary

The profile system enables:

* user identity
* feed personalization
* future social features

while maintaining a clean architecture that can evolve into the full InkVein ecosystem.
