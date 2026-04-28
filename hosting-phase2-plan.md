Phase 2 shifts the focus from "getting it to work" to **"making it secure and production-hardened."** In the 2026 ecosystem, this involves protecting your backend from unauthorized access and optimizing delivery for global performance using **Antigravity-specific** configurations.

---

## Phase 2: Security & Infrastructure Hardening

This phase implements the **"Zero-Trust"** architecture required for modern Firebase applications.

### 2.1: Firebase App Check (Anti-Abuse)
Standard API keys are not enough to prevent billing exhaustion from scrapers. App Check ensures only *your* app can talk to your services.

* **Setup**: Register your app with **reCAPTCHA Enterprise** in the Firebase Console.
* **Initialization Code**: Update `src/firebase.js` to include the App Check provider.
    ```javascript
    import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

    // Initialize after initializeApp(firebaseConfig)
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('YOUR_RECAPTCHA_SITE_KEY'),
      isTokenAutoRefreshEnabled: true
    });
    ```

### 2.2: Hardened Firestore Security Rules
Transition from "Test Mode" to a production-safe policy. Your configuration in `firebase.json` must point to these rules.

* **File**: `firestore.rules`
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Ensure only authenticated users can access their own data
        match /todos/{todoId} {
          allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
          allow create: if request.auth != null;
        }
      }
    }
    ```

### 2.3: Security Headers & Caching (`firebase.json`)
Update your hosting configuration to include browser-level security protections and performance caching.

* **Enhanced Configuration**:
    ```json
    {
      "hosting": {
        "public": "dist",
        "headers": [
          {
            "source": "/**",
            "headers": [
              { "key": "X-Frame-Options", "value": "DENY" },
              { "key": "X-Content-Type-Options", "value": "nosniff" },
              { "key": "Permissions-Policy", "value": "geolocation=(), microphone=()" }
            ]
          },
          {
            "source": "**/*.@(js|css|png|jpg|svg|webp)",
            "headers": [
              { "key": "Cache-Control", "value": "max-age=31536000" }
            ]
          }
        ],
        "rewrites": [{ "source": "**", "destination": "/index.html" }]
      }
    }
    ```

### 2.4: Antigravity MCP Integration
Configure the **Model Context Protocol (MCP)** to allow Antigravity to monitor your live project health.

* **File**: `.mcp/config.json`
    ```json
    {
      "mcpServers": {
        "firebase-admin": {
          "command": "npx",
          "args": ["-y", "@firebase/mcp-server"],
          "env": { "PROJECT_ID": "todolist-c6c81" }
        }
      }
    }
    ```

### 2.5: Final Atomic Deployment
Push all configurations—hosting, firestore rules, and security policies—in a single command to ensure a consistent state.

* **Command**: `npx -y firebase-tools@latest deploy --only hosting,firestore:rules`

---

### Antigravity Prompt: Phase 2 Security Hardening

**Role**: Senior Firebase Security Architect.
**Objective**: Implement production security and infrastructure hardening for `todolist-c6c81`.

**Instructions**:
1.  **App Check Implementation**: Update `src/firebase.js` to initialize **App Check** with a `ReCaptchaEnterpriseProvider`. Flag if the `VITE_RECAPTCHA_KEY` is missing from environment variables.
2.  **Firestore Rules**: Overwrite the default `firestore.rules` to ensure all `todos` documents are protected by `request.auth.uid` validation.
3.  **Hosting Security**: Update `firebase.json` to include **X-Frame-Options** and **X-Content-Type-Options** headers to prevent clickjacking and MIME-sniffing.
4.  **Performance Tuning**: Add a 1-year `Cache-Control` header for all static assets in the `dist/` folder.
5.  **MCP Linkage**: Set up the `.mcp/config.json` to enable Antigravity to read Firestore schemas and monitor deployment status.
6.  **Final Deploy**: Execute an atomic deployment of hosting and rules. Perform a **Live Audit** to verify the SSL/HTTPS status and Auth flow on the production `.web.app` URL.

**Constraint**: Every security change must be validated against the current 2026 Firebase best practices. Do not use legacy "Test Mode" rules.