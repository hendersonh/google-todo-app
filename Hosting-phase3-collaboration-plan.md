# Phase 3: Collaborative Magic Links (Detailed Specification)

## 1. Architectural Overview
This phase implements **Individual Task Sharing** using a "Token Vault" pattern. We decouple public viewing from the private `tasks` collection to maintain our "Zero-Trust" security model.

## 2. Data Model (`shared_links` collection)
Each link is a unique document in Firestore.
- **Document ID**: `uuid` (High-entropy token generated via `crypto.randomUUID()`)
- **Fields**:
  - `taskId`: String (Reference to the source task)
  - `ownerId`: String (UID of the creator)
  - `createdAt`: serverTimestamp
  - `expiresAt`: Timestamp (Set to `createdAt` + 7 days)
  - `taskSnapshot`: Map (Frozen copy of task data to ensure read-only consistency)
    - `title`: String
    - `details`: String
    - `completed`: Boolean
    - `category`: String

## 3. Security Infrastructure (`firestore.rules`)
Public access is restricted to the `shared_links` collection with time-based validation.
- **Read**: Allowed for ANYONE if `request.time < resource.data.expiresAt`.
- **Write**: Only the owner (matching `auth.uid` with `ownerId`) can create or delete tokens.
- **Isolation**: Public users cannot query the `tasks` collection directly.

## 4. Frontend Implementation
### 4.1 Routing (`App.jsx`)
- New Route: `/shared/:linkId`
- Component: `SharedTaskView`
- **Behavior**: This route bypasses the `RequireAuth` wrapper.

### 4.2 Services (`SharingService.js`)
- `createLink(task, userId)`: Generates UUID, calculates expiry, and saves to Firestore.
- `getSharedTask(linkId)`: Fetches token doc, validates expiry, and returns the `taskSnapshot`.

### 4.3 UI: The Shared View (`SharedTaskView.jsx`)
A premium, minimalist page designed for guests:
- **Visuals**: Centered card with glassmorphism or clean white background.
- **Fields**: Task title (H1), Details (paragraph), Status (Badge).
- **CTA**: "Get started with Google Todo" button to encourage user acquisition.

## 5. Security Guardrails
- **Token Entropy**: Using UUIDv4 prevents "URL guessing" attacks.
- **Data Minimization**: The `taskSnapshot` only includes essential fields (no subtasks or metadata unless explicitly added).
- **Rate Limiting**: (Optional) Could be added later via Firebase Functions if the Spark tier is exceeded.

## 6. Implementation Roadmap
- [ ] **Step 1**: Provision `shared_links` rules.
- [ ] **Step 2**: Create `SharingService`.
- [ ] **Step 3**: Integrate "Share" button in `TaskModal`.
- [ ] **Step 4**: Build `SharedTaskView` and register the route.
- [ ] **Step 5**: End-to-end testing (Incognito mode verification).
