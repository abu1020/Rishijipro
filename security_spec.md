# Security Specification & Security TDD Spec

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}/earnings/{earningId}` MUST strictly belong to the authenticated user whose `request.auth.uid == userId` and `incoming().userId == request.auth.uid`. No user may read, list, create, update, or delete another user's earnings.
2. **Numeric Integrity**: `grossAmount` must be a positive number (> 0), `deductions` must be a non-negative number (>= 0), and `netAmount` must accurately equal `grossAmount - deductions`.
3. **Immutability of Key Identification**: In updates, `userId` cannot be changed (`incoming().userId == existing().userId`).
4. **Field Constraints**: Mandatory field size limits (e.g. `category` <= 100 chars, `clientName` <= 150 chars, `referenceId` <= 100 chars, `notes` <= 1000 chars) preventing resource exhaustion.
5. **Verified Auth**: The requester must be authenticated (`request.auth != null`).

## 2. The "Dirty Dozen" Malicious / Invalid Payloads
1. **Unauthenticated Read/Write**: Request without `request.auth` attempting to read `/users/user123/earnings/earn1`. Expected: PERMISSION_DENIED.
2. **Cross-Tenant ID Spoofing on Create**: Authenticated user `victim456` attempting to create `/users/user123/earnings/earn1` with `userId: "user123"`. Expected: PERMISSION_DENIED.
3. **Cross-Tenant List Query**: Authenticated user `user123` querying subcollection `/users/victim456/earnings`. Expected: PERMISSION_DENIED.
4. **Foreign Document Read**: Authenticated user `user123` reading `/users/victim456/earnings/earn1`. Expected: PERMISSION_DENIED.
5. **Negative Gross Amount**: Attempting to create an earning with `grossAmount: -50.00`. Expected: PERMISSION_DENIED.
6. **Negative Deductions**: Attempting to create an earning with `deductions: -10.00`. Expected: PERMISSION_DENIED.
7. **Calculated Math Invariant Bypass**: Attempting to create an earning with `grossAmount: 100`, `deductions: 20`, but `netAmount: 200`. Expected: PERMISSION_DENIED.
8. **Owner Hijack on Update**: User `user123` trying to change their own earning's `userId` to `victim456`. Expected: PERMISSION_DENIED.
9. **Buffer Overflow Attack (Notes)**: User sending `notes` field exceeding 1000 characters. Expected: PERMISSION_DENIED.
10. **Ghost Field Injection**: User trying to inject arbitrary shadow fields like `isAdmin: true` or `shadowAccount: "x"`. Expected: PERMISSION_DENIED.
11. **Invalid ID Path Poisoning**: Attempting to write to an ID containing illegal punctuation/traversal or exceeding 128 characters. Expected: PERMISSION_DENIED.
12. **Unauthorized Cross-Tenant Delete**: User `user123` attempting to delete `/users/victim456/earnings/earn1`. Expected: PERMISSION_DENIED.
