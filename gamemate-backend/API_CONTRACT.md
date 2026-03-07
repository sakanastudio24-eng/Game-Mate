# GameMate Backend API Contract

**Version:** v1  
**Stack:** Django + DRF + PostgreSQL  
**Auth:** JWT Bearer Tokens  
**Base URL (local):**

```
http://127.0.0.1:8000
```

All authenticated requests require:

```
Authorization: Bearer <access_token>
```

---

# Authentication

## Login

POST `/api/auth/token/`

Request:

```
{
  "email": "user@email.com",
  "password": "password123"
}
```

Response:

```
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token"
}
```

---

## Refresh Token

POST `/api/auth/token/refresh/`

Request:

```
{
  "refresh": "jwt_refresh_token"
}
```

Response:

```
{
  "access": "new_access_token"
}
```

---

# Account

## Get Current User

GET `/api/accounts/me/`

Headers:

```
Authorization: Bearer <access_token>
```

Response:

```
{
  "id": 1,
  "email": "user@email.com",
  "username": "user",
  "profile": {
    "display_name": "user",
    "bio": "",
    "created_at": "2026-03-01T20:00:00Z"
  }
}
```

---

# Groups

## List Groups

GET `/api/groups/`

Returns:

* public groups
* groups the user owns
* groups the user is a member of

Response Example:

```
[
  {
    "id": 1,
    "name": "Chess Club",
    "description": "Testing group",
    "is_private": false,
    "owner": 1,
    "owner_email": "owner@email.com",
    "member_count": 3,
    "created_at": "2026-03-01T20:00:00Z"
  }
]
```

---

## Create Group

POST `/api/groups/`

Request:

```
{
  "name": "Ranked Squad",
  "description": "Grinding nightly",
  "is_private": false
}
```

Response:

```
{
  "id": 4,
  "name": "Ranked Squad",
  "description": "Grinding nightly",
  "is_private": false,
  "owner": 1,
  "owner_email": "owner@email.com",
  "member_count": 1,
  "created_at": "..."
}
```

---

## Retrieve Group

GET `/api/groups/{group_id}/`

Returns group detail.

Private groups require membership.

---

## Join Group

POST `/api/groups/{group_id}/join/`

Success Response:

```
{
  "message": "Joined."
}
```

Already member:

```
{
  "message": "Already a member."
}
```

Private group:

```
{
  "message": "This group is private. Invite required."
}
```

---

## Leave Group

POST `/api/groups/{group_id}/leave/`

Response:

```
{
  "message": "Group left."
}
```

Owner leaving group:

```
{
  "message": "Owner cannot leave their own group."
}
```

---

## List Members

GET `/api/groups/{group_id}/members/`

Requires group membership.

Response:

```
[
  {
    "user_id": 2,
    "email": "member@email.com",
    "username": "member",
    "role": "member",
    "joined_at": "2026-03-01T21:00:00Z"
  }
]
```

---

# Permission Rules

Public groups:

* anyone can view
* anyone can join

Private groups:

* only visible to members
* join requires invite

Group owner:

* can update group
* can delete group
* cannot leave own group

Members:

* can view group
* can leave group

Non-members:

* cannot view private group
* cannot access member list

---

# Error Responses

Validation errors return HTTP `400`.

Example:

```
{
  "name": [
    "Group name must be at least 3 characters."
  ]
}
```

Unauthorized requests return:

```
{
  "detail": "Authentication credentials were not provided."
}
```

---

# Future Endpoints (Not Implemented Yet)

Possible additions:

* group invites
* group roles (admin/mod)
* activity feed
* notifications
* search
