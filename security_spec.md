# Security Specification for Tankonomics

## Data Invariants
1. Users can only edit their own profiles.
2. News items can only be created by admins.
3. Forum posts must belong to a valid topic.
4. Survey votes must be unique per user per survey.
5. Content authors cannot be spoofed.

## The Dirty Dozen Payloads (Targeted for Denial)

1. **Identity Spoofing**: Attempt to create a post with someone else's `authorUid`.
2. **Admin Privilege Escalation**: User tries to set `isAdmin: true` on their own profile during registration.
3. **Ghost Update**: Update a post including a field `isVerified: true` which doesn't exist in the schema.
4. **News Injection**: Non-admin user tries to create a `news` document.
5. **ID Poisoning**: Create a post with a 2KB document ID.
6. **Relational Orphan**: Create a forum reply for a non-existent topic ID.
7. **Size Attack**: Post content exceeding 10,000 characters.
8. **Immutable Field Attack**: Try to change `createdAt` on an existing post.
9. **State Shortcut**: Bypass `likesCount` increments by setting it directly to 9999.
10. **Query Scraping**: Attempting a list query on `users` without a filter, trying to dump the entire directory.
11. **PII Leak**: Non-admin user tries to fetch another user's email directly.
12. **Timestamp Spoofing**: Sending a `createdAt` from the past/future instead of using `serverTimestamp()`.

## Test Runner Logic
The `firestore.rules.test.ts` will verify these scenarios.
