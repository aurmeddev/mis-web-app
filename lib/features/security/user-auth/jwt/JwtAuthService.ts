import { isEnvProduction } from "@/lib/env/isEnvProduction";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.NEXT_AUTH_SECRET_KEY;
const key = new TextEncoder().encode(secretKey);
/*
 * session timeout
 * 3600 seconds = 1 hr
 * 10800 seconds = 3 hrs
 */
export const expirationTime: number = isEnvProduction ? 3600 : 10800;

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3 hrs from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function refreshSession() {
  const dateUtils = new DatetimeUtils();
  const currentDateInTimezone = dateUtils.getDatesInTimezone();
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return null;
  }

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(
    currentDateInTimezone.getTime() + expirationTime * 1000
  );
  cookieStore.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });

  return cookieStore.get("session")?.value;
}
