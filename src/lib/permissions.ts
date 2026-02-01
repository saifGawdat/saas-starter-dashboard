import { Session } from "next-auth";

/**
 * Check if a user has a specific permission based on their session
 */
export function hasPermission(
  session: Session | null,
  permission: string,
): boolean {
  if (!session?.user) return false;

  // The token structure from src/auth.ts includes permissions as string[]
  // We cast to any to access the permissions field which is added in the session callback
  const userPermissions = (session.user as any).permissions as
    | string[]
    | undefined;
  return userPermissions?.includes(permission) ?? false;
}

/**
 * Helper to check if a user is an Admin (has all permissions or shortcut check)
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  return (session.user as any).role === "Admin";
}
