# Core

Purpose:
- hold shared service helpers that do not belong to one feature app

Current use:
- lightweight event-rate controls and similar cross-cutting helpers

Notable files:
- `services/event_service.py`: in-memory event allowance helper used to slow repeated actions
