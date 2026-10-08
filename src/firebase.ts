/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

/* ==========================================================================
 * FIREBASE CONFIGURATION SETUP
 * ==========================================================================
 * By default, this app imports the provisioned config from `firebase-applet-config.json`.
 * If you are running this app outside Google AI Studio or using your own Firebase project,
 * replace the object below with your credentials from the Firebase Console:
 * Project Settings -> General -> Your apps -> Web app -> SDK setup and configuration.
 * ========================================================================== */

import appletConfig from '../firebase-applet-config.json';

// You can override this configuration with your own Firebase Console config:
export const customFirebaseConfig = {
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
  messagingSenderId: appletConfig.messagingSenderId,
  appId: appletConfig.appId,
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || '(default)',
};

// Check if configuration is valid
export const isConfigValid = Boolean(
  customFirebaseConfig.apiKey &&
  customFirebaseConfig.projectId &&
  !customFirebaseConfig.apiKey.includes('YOUR_')
);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(customFirebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore (CRITICAL: Pass firestoreDatabaseId if custom database is provisioned)
export const db =
  customFirebaseConfig.firestoreDatabaseId &&
  customFirebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, customFirebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Validate Connection to Firestore on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase Client Offline: Please check your network or Firebase configuration.');
      return false;
    }
    // Permission denied or non-existent doc is acceptable for health check
    return true;
  }
}

// Run the connection check immediately
testConnection();

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

/* ==========================================================================
 * FIRESTORE ERROR HANDLING (Mandatory Skill Standard)
 * ========================================================================== */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
