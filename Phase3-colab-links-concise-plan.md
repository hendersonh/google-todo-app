# Plan: Collaborative Magic Links (Testable Increments)

Implement individual task sharing via a secure **"Token Vault"** pattern using a dedicated `shared_links` collection.

## Part 1: The Secure Pipeline (Backend)
**Goal**: Verify tokens can be created and read securely.
- [x] **Step 1: Security Rules** — Update `firestore.rules` for `shared_links` collection.
- [x] **Step 2: Service Layer** — Create `src/services/SharingService.js` for CRUD operations.
- [x] **Part 1 Verification**: Service and Rules verified (Tokens are UUIDs with 7-day expiry).

## Part 2: The Owner's Handshake (UX)
**Goal**: Verify owners can generate and copy links flawlessly.
- [ ] **Step 3: UI Integration** — Add "Share Task" button to `TaskModal.jsx`.
- [ ] **Step 4: Feedback Logic** — Implement "Link Copied" and loading states.
- [ ] **Part 2 Verification**: Generate a link from the UI and verify it is copied to the clipboard in the correct format (`/shared/:id`).

## Part 3: The Public Window (Guest)
**Goal**: Verify guests see a premium, read-only view.
- [ ] **Step 5: Routing** — Register the `/shared/:linkId` route in `App.jsx`.
- [ ] **Step 6: Shared Component** — Develop the `SharedTaskView.jsx` minimalist UI.
- [ ] **Part 3 Verification**: Open a link in an **Incognito Window**. Verify the task is visible, but the sidebar and edit controls are hidden.

---

## Security Audit & Final Polish
- [ ] **Step 7: Data Leak Check** — Ensure private fields (userId, raw category IDs) aren't in the public response.
- [ ] **Step 8: Expiration Audit** — Manually expire a token in Firestore to verify the "Link Expired" screen.
