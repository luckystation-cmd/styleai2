# Security Specification - StyleAI

## 1. Data Invariants
- **Users**:
    - A user document must exist at `/users/{uid}`.
    - `credits` must be non-negative.
    - `email` must be a valid email string and match the authenticated user's email.
    - `updatedAt` must be a server timestamp.
- **Recharges**:
    - A recharge document at `/recharges/{id}` must belong to the user who created it (`userId == auth.uid`).
    - `amount` must be positive.
    - `status` can only transition forward (though currently only `pending` and `approved` are used).
    - `txId` is required.

## 2. The Dirty Dozen Payloads
Below are payloads that SHOULD be rejected by the security rules:

1. **Identity Spoofing**: Create a user document for a different UID.
2. **Credit Injection**: Initialize a user document with 1,000,000 credits instead of 10.
3. **Credit Theft**: Decrement another user's credits.
4. **Email Impersonation**: Create a user record with an email different from the auth token.
5. **Negative Credits**: Set credits to -5.
6. **Bypassing Immutability**: Change the `email` field during an update.
7. **Resource Poisoning**: Use a 2MB string as a `txId`.
8. **Orphaned Recharge**: Create a recharge record for a userId that doesn't match the auth UID.
9. **Status Hijacking**: Update a recharge's status to 'approved' if you are the user who created it (without being an admin).
10. **Ghost Fields**: Add an `isAdmin: true` field to a user document.
11. **Client Timestamps**: Provide a client-side date for `updatedAt` or `createdAt` instead of `serverTimestamp()`.
12. **Unauthorized Scraping**: List all users.

## 3. Test Runner Plan
I will use the `firestore.rules` logic and verify it manually/via logic checks, as setting up a full `firestore-jest` or `firebase-testing` environment might be complex in this sandbox without extra tools, but I will ensure the rules themselves are logically sound against these payloads.
