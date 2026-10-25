import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import prodConfig from '../firebase-applet-config.json';
import stagingConfig from '../firebase-applet-config.staging.json';

// Which Firebase project the app talks to. Production unless the app was
// started or built with VITE_FIREBASE_TARGET=staging (see docs/STAGING_SETUP.md).
export const FIREBASE_TARGET: 'production' | 'staging' =
  (import.meta as any).env?.VITE_FIREBASE_TARGET === 'staging' ? 'staging' : 'production';
const firebaseConfig = FIREBASE_TARGET === 'staging' ? stagingConfig : prodConfig;
if (FIREBASE_TARGET === 'staging' && typeof document !== 'undefined') {
  // Make it impossible to mistake the staging app for production: a fixed red
  // ribbon on every page, a [STAGING] tab title, and a console warning.
  console.warn('Tankonomics is connected to the STAGING Firebase project:', firebaseConfig.projectId);
  const mark = () => {
    if (!document.title.startsWith('[STAGING]')) document.title = '[STAGING] ' + document.title;
    if (!document.getElementById('staging-ribbon')) {
      const r = document.createElement('div');
      r.id = 'staging-ribbon';
      r.textContent = 'STAGING · ' + firebaseConfig.projectId;
      r.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#c62828;color:#fff;' +
        'font:600 12px/1.8 system-ui,sans-serif;text-align:center;letter-spacing:.08em;pointer-events:none;';
      document.body.appendChild(r);
    }
  };
  if (document.body) mark(); else document.addEventListener('DOMContentLoaded', mark);
  // Keep the prefix if any page later changes the tab title.
  new MutationObserver(mark).observe(document.head, { childList: true, subtree: true, characterData: true });
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
