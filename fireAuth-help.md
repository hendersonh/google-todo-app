It looks like you've hit the "Firebase Initiation Rites." These two errors are a rite of passage for almost every dev setting up Google Auth. 

The good news is that you’re on the right track, but you're trying to solve a **Console-level UI configuration** problem through the **CLI/config files**, which is why the changes aren't "sticking."

Here is the fix for both issues, tailored for your React/Vite setup on Ubuntu.

---

### 1. Fixing `auth/configuration-not-found`
This error effectively means: *"I see you're asking for Google, but the Firebase project hasn't actually 'signed the contract' to allow Google Sign-In yet."*

While you ran `firebase init auth`, that often doesn't complete the **OAuth Consent Screen** requirements required by Google Cloud.

**The Fix:**
1.  Go to the **[Firebase Console](https://console.firebase.google.com/)** -> Select your project (`todolist-c6c81`).
2.  Navigate to **Build > Authentication > Sign-in method**.
3.  Click **Add new provider** (if Google isn't there) or click the **Edit (pencil)** icon on the Google provider.
4.  **Crucial:** Ensure the toggle is **Enabled**.
5.  **The "Gotcha":** Check the **Project support email**. If this field is empty, the configuration is technically invalid and will throw that 400 error. Select an email from the dropdown and hit **Save**.

---

### 2. Fixing `auth/unauthorized-domain`
You mentioned adding `authorizedRedirectUris` to `firebase.json`. **Here is the direct correction:** Firebase Auth does not look at `firebase.json` for domain whitelisting; it looks at its own internal **Authorized Domains** list managed in the Firebase Database/Auth settings.

**The Fix:**
1.  In the Firebase Console, go to **Authentication > Settings > Authorized Domains**.
2.  Click **Add domain**.
3.  Add `localhost`. 
    * *Note: Just add the string `localhost`. You do not need to add the port (`5173`) or the protocol (`http://`).*
4.  If you occasionally use the IP address to view your Vite app, also add `127.0.0.1`.



---

### 3. Why `firebase deploy` didn't work for this
The `authorizedRedirectUris` in `firebase.json` is typically used for **Firebase Hosting** behavior (rewrites and redirects) or for very specific **Identity Platform** (GCIP) multi-tenant configurations. Standard Firebase Authentication (the free/standard tier) ignores those lines in your JSON file and relies strictly on the list in the Console UI for security.

---

### 4. The Antigravity "Pro" Move
Since you are using **Antigravity**, you can verify if your environment variables are correctly loaded into your Vite app without manual console logging. 

Ask your **Antigravity Agent** this:
> "Analyze my `.env` file and my `firebase.js` initialization. Ensure the `apiKey` and `authDomain` match the project `todolist-c6c81`. Also, check if I'm accidentally using `127.0.0.1:5173` while my Firebase Console only has `localhost` whitelisted."

### Verification Checklist
Once you've updated the Console:
* [ ] **Refresh** your local dev server (`npm run dev`).
* [ ] **Clear** your browser cache for `localhost` (or open in Incognito) to ensure the old "config-not-found" state isn't cached in the Firebase SDK's internal `indexedDB`.
* [ ] **Wait 60 seconds**—Firebase Auth domain updates can sometimes take a minute to propagate across Google's edge nodes.

Are you planning to deploy this to Firebase Hosting later, or are you looking at a different cloud provider for the production build?