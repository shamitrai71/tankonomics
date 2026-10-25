# Tankonomics staging project: setup and use (25 Oct 2026)

Staging is a second Firebase project, `tankonomics-staging`, used to rehearse seeds and the Big Merge before anything touches production. Production (`tankonomics`) is unchanged.

The app picks its project from `VITE_FIREBASE_TARGET`:
- **Not set:** production (`firebase-applet-config.json`).
- **Set to `staging`:** staging (`firebase-applet-config.staging.json`). The browser tab title starts with **[STAGING]**, and the browser console shows a warning.

## 1. Create the project (once, in the Firebase console)

1. **Create the project.** Go to <https://console.firebase.google.com> and choose *Add project*, named `tankonomics-staging`. Google Analytics is not needed.
   - If the console gives a different project ID (for example `tankonomics-staging-1a2b3`), use that ID in steps 6 and 7.
2. **Billing.** Choose *Upgrade* and select the Blaze plan. Then set a budget alert of US$5 under *Usage and billing* → *Details & settings* → *Budget alerts*.
   - **Why:** a full seed is about 50,000 writes, and the free Spark plan stops at 20,000 writes a day.
   - **Cost:** a rehearsal costs cents.
3. **Firestore.** Go to *Build* → *Firestore Database* → *Create database* and choose production mode.
   - **Location:** pick the same location as production. To find it, check `tankonomics` → Firestore → *Settings*. The location can't be changed later.
4. **Sign-in.** Go to *Build* → *Authentication* → *Get started* and enable **Google** and **Email/Password**. `localhost` is already an authorised domain.
5. **Storage.** Go to *Build* → *Storage* → *Get started*. This is only needed if logos or banners will be uploaded in staging.
6. **Web app.** Go to *Project settings* → *Your apps* → *Web* (`</>`) and add an app called "Tankonomics staging".
   - Copy `apiKey`, `appId` and `messagingSenderId` into `firebase-applet-config.staging.json`, replacing the `REPLACE_WITH_…` values.
   - If the project ID differs from `tankonomics-staging`, update `projectId`, `authDomain` and `storageBucket` to match.
7. **CLI alias.** If the project ID differs, also update `"staging"` in `.firebaserc`.

## 2. Publish rules and indexes to staging (PowerShell, in the project folder)

```powershell
firebase login            # first time only
firebase deploy --only firestore:rules,firestore:indexes,storage --project staging
```

## 3. Run the app against staging (on your PC; no hosting needed)

```powershell
cd C:\dev\Tankonomics          # your local Tankonomics folder
npm run dev:staging
```

1. **Check the PowerShell window.** It must print `Firebase project: STAGING (tankonomics-staging)`. Plain `npm run dev` prints `production (tankonomics)`.
2. **Check the page.** Open <http://localhost:3000>. A red **STAGING · tankonomics-staging** bar runs along the bottom of every page, and the tab title starts with **[STAGING]**.
3. **Sign in** with `esraigroup@gmail.com`. The rules and the app grant admin to that email, so no setup is needed.
4. **Finish** by stopping with Ctrl+C. `npm run dev` always runs production.

`npm run dev:staging` reads `staging.env`, which contains `VITE_FIREBASE_TARGET=staging`. Setting `$env:VITE_FIREBASE_TARGET = "staging"` before `npm run dev` does the same.

## 4. Rehearsal checklist

1. **Seed:** in Admin → Companies, run *Seed master tree*, then *Seed companies*, then *Seed locations*. Later, run the Big Merge seeder.
2. **Check:** check counts, a sample of company pages, categories and locations. Then check the Usage tab in the staging console for reads and writes.
3. **Delete:** delete staging data freely; staging is disposable.
4. **Production:** repeat on production only after the rehearsal is clean.

## 5. Rules for using staging

- **Never deploy hosting to staging.** It runs from `localhost` only.
- **Never copy data from staging to production.** Production is always seeded from the source files.
- **Keep staging current:** rules and indexes go to staging first (`--project staging`), then to production (`deploy.ps1`).
