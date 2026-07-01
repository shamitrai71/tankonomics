#requires -Version 5.1
<#
.SYNOPSIS
    Deploy script for Tankonomics (PowerShell port of deploy.sh).
.DESCRIPTION
    Cloud Build only deploys the React app. It does NOT deploy Firestore
    rules. Rules must be deployed separately, which is why the event-save
    bug kept biting -- the rules patch was committed to the repo but never
    published to Firebase.

    This script handles both:
      1) Firestore rules -> firebase deploy --only firestore:rules
      2) App code        -> git push (Cloud Build picks it up)

    Run from anywhere:  .\deploy.ps1
#>

$ErrorActionPreference = "Stop"

# Always operate from the script's own folder, regardless of where it's run from.
Set-Location $PSScriptRoot

Write-Host "==================================================================="
Write-Host "  Tankonomics deploy"
Write-Host "==================================================================="

# ------------------------------------------------------------------------
# Step 1: Deploy Firestore rules
# ------------------------------------------------------------------------

$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseCmd) {
    Write-Host ""
    Write-Host "Firebase CLI not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install it with:  npm install -g firebase-tools"
    Write-Host "Then sign in:     firebase login"
    Write-Host ""
    Write-Host "Or, deploy rules + indexes manually via the Firebase Console:"
    Write-Host "  1. Open https://console.firebase.google.com/project/tankonomics/firestore/rules"
    Write-Host "  2. Paste the contents of .\firestore.rules"
    Write-Host "  3. Click Publish"
    Write-Host "  4. For indexes, use the console's Indexes tab, or click the auto-generated"
    Write-Host "     link that appears in the browser console when a query needs one."
    Write-Host ""
    Write-Host "Skipping rules deploy."
}
else {
    Write-Host ""
    Write-Host "[1/2] Deploying Firestore rules + indexes..."
    Write-Host ""

    firebase deploy --only firestore:rules,firestore:indexes --project tankonomics

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Firestore rules deploy failed (exit code $LASTEXITCODE). Stopping before git push." -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Rules + indexes published. Rules propagate within ~30s; new indexes may take a few minutes to build (watch the Firestore console)." -ForegroundColor Green
}

# ------------------------------------------------------------------------
# Step 2: Trigger Cloud Build via git push
# ------------------------------------------------------------------------

Write-Host ""
Write-Host "[2/2] Pushing code to trigger Cloud Build..."
Write-Host ""

$pendingChanges = git status --porcelain

if ($pendingChanges) {
    Write-Host "Uncommitted changes detected. Commit them first:" -ForegroundColor Yellow
    Write-Host ""
    git status --short
    Write-Host ""
    Write-Host "  git add -A; git commit -m 'event multi-day support + rule fix'"
    Write-Host "  .\deploy.ps1"
    exit 1
}

git push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "git push failed (exit code $LASTEXITCODE)." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================================================="
Write-Host "  Done. Cloud Build will deploy in ~3-5 minutes."
Write-Host "  Check progress:"
Write-Host "    https://console.cloud.google.com/cloud-build/builds?project=tankonomics"
Write-Host "==================================================================="
