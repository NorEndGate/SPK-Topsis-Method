import { AppRole } from "@/lib/rbac/permissions";

export type AppSessionUser = {
  id: string;
  name: string;
  email: string;
  roles: AppRole[];
};

export const auth = {
  handler: {},
};

export async function getCurrentUser(): Promise<AppSessionUser> {
  // Phase 6 keeps a deterministic demo user so pages and API routes can be developed
  // before the Better Auth session adapter is wired to middleware.
  return {
    id: "demo-admin",
    name: "Admin Demo",
    email: "admin@demo.local",
    roles: ["ADMIN"],
  };
}
