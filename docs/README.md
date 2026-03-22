# GameMate Docs

Docs are grouped by concern instead of kept flat.

- `architecture/` current frontend architecture, component boundaries, design system
- `backend/` backend contracts, backend overview, deployment and validation notes
- `build/` platform build and workflow notes
- `flows/` user flows, feed flow, back navigation rules
- `handoff/` scope, audit, API handoff, delivery status
- `postmortems/` consolidated incidents and lessons
- `reference/` durable supporting references

JS package manager convention:
- the frontend app uses `pnpm`
- dependency changes should update `pnpm-lock.yaml`
- do not reintroduce `package-lock.json`
