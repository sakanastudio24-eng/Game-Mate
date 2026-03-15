# Accounts

Purpose:
- custom user model
- signup, login, refresh, logout
- current-profile and public-profile APIs
- auth throttling and profile auto-creation

Key models:
- `User`
- `Profile`

Key responsibilities:
- issue JWT sessions through SimpleJWT
- create a profile row for every new user
- enforce that users only edit their own profile
- expose safe public profile data based on visibility rules

Notable files:
- `views.py`: signup/auth/profile endpoints
- `throttles.py`: login and signup rate limits
- `signals.py`: auto-create profile
