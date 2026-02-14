# Specification

## Summary
**Goal:** Audit the app end-to-end and fix broken routing and key product flows, including Focus Mode completion and Weekly Reset behavior.

**Planned changes:**
- Perform an end-to-end functional audit across Login, Onboarding gate, Dashboard, Mind Dump, Clarify, Projects, Weekly Reset, and Profile; fix broken navigation, runtime errors, and dead-end states found.
- Fix TanStack Router configuration so guest-only routes (notably `/login`) are in the active route tree, work while logged out, and correctly redirect based on auth state.
- Implement Focus Mode “Mark Done” so it persists task completion in the backend and the Dashboard updates immediately after exiting Focus Mode (with backend ownership enforcement).
- Implement Weekly Reset “Close this week & reset” to persist the weekly review and clear the authenticated user’s current tasks for the new week (with backend ownership enforcement).

**User-visible outcome:** Users can navigate through core pages without router errors or blank screens; logged-out users can reach and use `/login` and are redirected appropriately; tasks can be marked done in Focus Mode and disappear from the Dashboard afterward; submitting Weekly Reset saves the review and clears the user’s tasks for the new week.
