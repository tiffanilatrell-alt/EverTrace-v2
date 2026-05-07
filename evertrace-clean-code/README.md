# EverTrace V2

A clean mobile-first React/Vite foundation for the EverTrace V2 memorial platform.

```sh
npm install
npm run dev
```

## Current scope

- React Router shell
- TailwindCSS base theme
- Mobile-first layout wrapper
- Pages for Home, Start Tribute, Tribute Page, and Example Tribute

## Routes

- `/`
- `/start`
- `/tribute/:tributeId`
- `/example`

## Planned data model

### `tributes/{tributeId}`

- `name`
- `birthYear`
- `passingYear`
- `message`
- `creatorName`
- `email`
- `visibility`
- `createdAt`

### `tributes/{tributeId}/memories/{memoryId}`

- `tributeId`
- `contributorName`
- `text`
- `createdAt`
- `reactionCounts.candle`
- `reactionCounts.love`
- `reactionCounts.flowers`

### `tributes/{tributeId}/photos/{photoId}`

- `tributeId`
- `photoUrl`
- `createdAt`
