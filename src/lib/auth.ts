// Simple local auth — no Firebase needed
// Users are stored in localStorage via Zustand persist

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export function generateUid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function hashPassword(password: string): string {
  // Simple obfuscation for local storage (not for production security)
  return btoa(password + '_ottstream_salt');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
