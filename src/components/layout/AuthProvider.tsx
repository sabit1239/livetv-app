'use client';
// No Firebase — auth is handled purely by Zustand + localStorage
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
