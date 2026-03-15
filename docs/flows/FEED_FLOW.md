# Feed Flow

## Goal

The feed should feel intentional, explainable, and stable under refresh, retries, and interaction updates.

## Principles

- show the content, not backend metadata
- keep creator identity visible
- make explicit skip a real negative signal
- treat passive scroll-away as weaker than explicit skip
- explanation and actions should be accessible without breaking immersion

## Visible Card Contract

Frontend card chrome should stay minimal:
- creator avatar
- title
- description
- primary actions

Do not surface backend-only ranking metadata on the face of the card.

## Backend Ranking Role

Backend is responsible for:
- selecting eligible posts
- filtering deleted content
- ranking by recency, interest match, social signals, and engagement
- providing explainability metadata

## Frontend Rendering Role

Frontend is responsible for:
- loading, empty, error, and retry states
- keeping interactions responsive
- removing explicitly skipped items from the current session when appropriate
- reloading feed pages without breaking the current viewing experience

## Interaction Model

Supported:
- like
- unlike
- share
- skip
- explain

Current note:
- full backend comment system is not the core of the current contract yet
- comment drawer is a UI surface and should not be treated as a complete social-thread backend feature

## Explainability Flow

Explainability is a supporting surface, not the main UI.

Expected flow:
1. user taps the explain action
2. app opens a full-screen-covered sheet
3. app renders human-readable reasons
4. dismissal returns the user to the same feed context

## Search Relationship

Feed search is a related but separate surface.

Expected flow:
- feed search opens the video-first search screen
- search results can overflow visually under the bottom nav where appropriate
- back from search returns to feed context cleanly

## Failure Rules

- network failure should not destroy current cached feed state
- expired session should use the shared sign-in-again contract
- retry should be available for retryable failures
- bad post identifiers should fail cleanly, not blank the screen
