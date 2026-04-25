import { cookies } from "next/headers";
import { ADMIN_PASSWORD } from "@/lib/config";

const COOKIE_NAME = "saree-admin";

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value === ADMIN_PASSWORD;
}

export async function setAdminCookie(password: string): Promise<boolean> {
  if (password !== ADMIN_PASSWORD) return false;
  const c = await cookies();
  c.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return true;
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
