import { auth } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user on the server side
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require a specific role - throws if user doesn't have the role
 */
export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
}

