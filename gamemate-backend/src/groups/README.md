# Groups

Purpose:
- manage community groups, membership, owner/admin actions, and visibility rules

Key models:
- `Group`
- `GroupMembership`

Key responsibilities:
- create, list, retrieve, update, and soft-govern group state
- enforce public/private access
- enforce owner-only invite, promote, and destructive actions
- block owners from orphaning their own group

Notable files:
- `views.py`: group CRUD and membership actions
- `permissions.py`: member/owner permission classes
- `serializers.py`: group and membership payload validation
