# SWR Migration

Go through the entire codebase and refactor our data fetching and server state management to use **SWR** as the primary data layer.

Our app relies heavily on:

- API responses
- Remote data
- Cached fetch results
- Auto revalidation
- Background refetching
- Optimistic updates

### Goals

1. Replace all manual `fetch`, `useEffect`, and custom data loading logic with **SWR hooks**.
2. Create reusable data hooks for each resource (e.g. `useUsers`, `useWebsites`, `useAnalytics`, etc).
3. Centralize the fetcher logic in a shared utility.
4. Ensure all API data is:
   - Cached globally
   - Automatically revalidated
   - Shared across components
   - Optimistically updated where mutations occur

### Requirements

- Use `useSWR` for GET requests
- Use `mutate` for POST, PUT, DELETE mutations with optimistic updates
- Avoid duplicate requests across components
- Remove redundant local state that mirrors API data
- Preserve existing API routes and backend logic

### Architecture

- Add a global SWR config provider at the app root
- Create a `/lib/fetcher.ts` for the base fetcher
- Create `/hooks` for all SWR data hooks
- Ensure proper error handling and loading states

### Important

This app is **server-state driven**, not UI-state driven.
Do not replace UI state (modals, forms, toggles) with SWR.
Refactor the codebase cleanly and consistently to follow modern Next.js + SWR best practices.
