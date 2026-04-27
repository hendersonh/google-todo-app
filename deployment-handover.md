# Firebase Hosting Deployment Handover Guide

This document contains the essential configuration and code snippets required for an external helper to deploy the Google Todo App to Firebase Hosting.

## 1. Project Overview
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth & Firestore)
- **Target**: Firebase Hosting (Classic)

## 2. Configuration Snippets

### `package.json` (Build Scripts)
Shows how to generate the production bundle and lists dependencies.
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^12.12.1",
    "react": "^18.3.1",
    "tailwindcss": "^4.2.4"
  }
}
```

### `vite.config.js` (Build Tool Config)
Confirms the build tool and active plugins.
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### `firebase.json` (Hosting Configuration)
**Recommended Configuration**: This includes the necessary `hosting` section for a Single Page Application (SPA).
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### `.firebaserc` (Project Mapping)
Maps the local environment to the Firebase project ID.
```json
{
  "projects": {
    "default": "todolist-c6c81"
  }
}
```

### `src/firebase.js` (Firebase Initialization)
Shows the connection parameters for the backend services.
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8-TmagjO-yarfdk0q-Qf_gM5_rJILzDc",
  authDomain: "todolist-c6c81.firebaseapp.com",
  projectId: "todolist-c6c81",
  storageBucket: "todolist-c6c81.firebasestorage.app",
  messagingSenderId: "526793244888",
  appId: "1:526793244888:web:086a92868fd80c479157ad"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## 3. Deployment Steps for the Helper
1. **Environment Setup**: 
   - Install Node.js dependencies: `npm install`
   - Install Firebase CLI: `npm install -g firebase-tools`
2. **Build**: 
   - Generate production assets: `npm run build`
   - Verify the `dist/` directory exists.
3. **Authentication**: 
   - Login to Firebase: `firebase login`
4. **Deploy**: 
   - Deploy only the hosting assets: `firebase deploy --only hosting`
