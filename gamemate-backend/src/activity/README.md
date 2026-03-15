# Activity

Purpose:
- record important user actions as durable activity events

Key model:
- `Activity`

Key responsibilities:
- store action type, object id, metadata, and actor
- support later analytics, admin debugging, and audit trails

Notable files:
- `models.py`: activity schema
- `services/activity_service.py`: helper used by signals or domain logic
