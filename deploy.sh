#!/usr/bin/env bash
# Deploy script for Tankonomics.
#
# IMPORTANT: Cloud Build only deploys the React app. It does NOT deploy
# Firestore rules. The rules must be deployed separately, which is why the
# event-save bug kept biting — the rules patch was committed to the repo
# but never published to Firebase.
#
# This script handles both:
#   1) Firestore rules → `firebase deploy --only firestore:rules`
#   2) App code → `git push` (Cloud Build picks it up)
#
# Run from project root:  bash deploy.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "═══════════════════════════════════════════════════════════════"
echo "  Tankonomics deploy"
echo "═══════════════════════════════════════════════════════════════"

# ──────────────────────────────────────────────────────────────────────
# Step 1: Deploy Firestore rules
# ──────────────────────────────────────────────────────────────────────

if ! command -v firebase &> /dev/null; then
  echo "⚠️  Firebase CLI not installed."
  echo ""
  echo "Install it with:  npm install -g firebase-tools"
  echo "Then sign in:     firebase login"
  echo ""
  echo "Or, deploy rules manually via the Firebase Console:"
  echo "  1. Open https://console.firebase.google.com/project/tankonomics/firestore/rules"
  echo "  2. Paste the contents of ./firestore.rules"
  echo "  3. Click Publish"
  echo ""
  echo "Skipping rules deploy."
else
  echo ""
  echo "[1/2] Deploying Firestore rules..."
  echo ""
  firebase deploy --only firestore:rules --project tankonomics
  echo ""
  echo "✓ Rules published. Propagation usually completes within 30 seconds."
fi

# ──────────────────────────────────────────────────────────────────────
# Step 2: Trigger Cloud Build via git push
# ──────────────────────────────────────────────────────────────────────

echo ""
echo "[2/2] Pushing code to trigger Cloud Build..."
echo ""

if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes detected. Commit them first:"
  echo ""
  git status --short
  echo ""
  echo "  git add -A && git commit -m 'event multi-day support + rule fix'"
  echo "  bash deploy.sh"
  exit 1
fi

git push

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Done. Cloud Build will deploy in ~3-5 minutes."
echo "  Check progress:"
echo "    https://console.cloud.google.com/cloud-build/builds?project=tankonomics"
echo "═══════════════════════════════════════════════════════════════"
