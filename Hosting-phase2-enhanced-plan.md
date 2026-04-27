# Phase 2: Security & Infrastructure Hardening (Spark/Free Tier Edition)

Following Kaizen principles: small, testable, and verified improvements.

## Module 2.1: Environmental Readiness & Safety
- [ ] **Step 2.1.1: Billing Awareness**  
  Confirming the project remains on the **Spark** plan.
- [ ] **Step 2.1.2: Config Audit**  
  Verify `src/firebase.js` matches the project ID `todolist-c6c81`.

## Module 2.2: Data Safety Gate (Hardened Firestore Rules)
*Goal: Move beyond basic ownership to strict schema validation.*
- [ ] **Step 2.2.1: Type-Safe Task Rules**  
  Add validation to `firestore.rules`:
  - `completed` must be boolean.
  - `title` must be under 200 characters.
  - `userId` must match the authenticated user.
- [ ] **Step 2.2.2: Local Rules Validation**  
  Run syntax check using Firebase CLI tools.
  - **Verification**: `npx -y firebase-tools@latest firestore:rules:validate`

## Module 2.3: Delivery Optimization (`firebase.json`)
*Goal: Optimize for security and speed within Spark limits.*
- [ ] **Step 2.3.1: Security Headers Setup**  
  Configure `X-Frame-Options` (prevent clickjacking) and `X-Content-Type-Options`.
- [ ] **Step 2.3.2: Static Asset Caching**  
  Apply a 1-year cache to JS/CSS/Images to improve returning user performance.
- [ ] **Step 2.3.3: SPA Routing Rule Verification**  
  Ensure all routes map to `index.html`.

## Module 2.4: Antigravity Monitoring (MCP Linkage)
- [ ] **Step 2.4.1: MCP Configuration**  
  Enable `.mcp/config.json` for live monitoring.

## Module 2.5: Production Rollout & Final Audit
- [ ] **Step 2.5.1: Atomic Deployment**  
  Deploy hosting and rules together.
- [ ] **Step 2.5.2: Live Verification**  
  Audit SSL and Auth flows on `https://todolist-c6c81.web.app`.
