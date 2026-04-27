# Firebase Cloud Hosting Deployment Plan (Enhanced)

Deploy the Vite React Todo application to Firebase Hosting (Classic) using Kaizen principles for high-performance delivery, error-proofing, and infrastructure readiness.

## Scope

- **In**: Build optimization, `firebase.json` SPA configuration, billing verification, local emulation, and live URL validation.
- **Out**: Automatic CI/CD pipelines (GitHub Actions) and Firebase App Hosting (SSR).

## Phase 1: Infrastructure & Billing Readiness

- [ ] **Step 1.1: Billing Plan Verification**  
  Check the current project's pricing plan. 
  - **Command**: `npx -y firebase-tools@latest projects:list`
  - **Goal**: Confirm if on **Spark** (Free) or **Blaze** (Pay-as-you-go). Note that Spark is sufficient for <10GB/month bandwidth.
- [ ] **Step 1.2: Budget Alerts (Safety First)**  
  If using the **Blaze** plan, ensure budget alerts are configured in the Google Cloud Console to prevent surprise costs from traffic spikes.
- [ ] **Step 1.3: Environment Variables Validation**  
  Verify that all `VITE_FIREBASE_*` keys are correctly set for production.
  - **Action**: Check for a `.env.production` file or ensured env vars in the shell environment.

## Phase 2: Production Build & Quality Control

- [ ] **Step 2.1: Automated Pre-flight Check**  
  Run linting and basic tests to ensure the production build is clean.
  - **Command**: `npm run lint`
- [ ] **Step 2.2: Optimized Build Generation**  
  Generate the static assets for deployment.
  - **Command**: `npm run build`
  - **Validation**: Ensure the `dist/` folder is populated with hashed JS/CSS files.

## Phase 3: Firebase Configuration (SPA Support)

- [ ] **Step 3.1: SPA Rewrite Rule (`firebase.json`)**  
  Configure the hosting block to redirect all requests to `index.html` to support client-side routing.
  ```json
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
  ```
- [ ] **Step 3.2: Security Rules Alignment**  
  Verify that `firestore.rules` and `storage.rules` are correctly referenced in `firebase.json` to be deployed simultaneously.

## Phase 4: Local Production Preview (The Gatekeeper)

- [ ] **Step 4.1: Live Production Simulation**  
  Test the exact `dist/` bundle locally using the Firebase emulator.
  - **Command**: `npx -y firebase-tools@latest emulators:start --only hosting`
  - **Test**: Navigate to a sub-route (e.g., `/search`) and refresh. If it loads, SPA rules are correct.

## Phase 5: Deployment & Verification

- [ ] **Step 5.1: Atomic Deployment**  
  Push the optimized assets and security rules to the live global CDN.
  - **Command**: `npx -y firebase-tools@latest deploy --only hosting,firestore:rules`
- [ ] **Step 5.2: Live Audit**  
  Verify the live `.web.app` or `.firebaseapp.com` URL.
  - **Check**: SSL/HTTPS status, Firebase Auth sign-in flow, and Firestore data persistence.

---

## Technical Notes (Kaizen)

- **Poka-Yoke**: The "Local Production Preview" step is mandatory to catch 404 routing issues before they reach users.
- **Standardization**: All Firebase commands use `npx -y firebase-tools@latest` to ensure version consistency.
- **Just-In-Time**: CI/CD (GitHub Actions) is deferred until after the initial manual deployment is validated.
