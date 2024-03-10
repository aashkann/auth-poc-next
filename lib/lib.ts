import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import React from 'react'


export const APP_NAME = "SpeckleReactDemo";
export const TOKEN = `${APP_NAME}.AuthToken`;
export const REFRESH_TOKEN = `${APP_NAME}.RefreshToken`;
export const CHALLENGE = `${APP_NAME}.Challenge`;

export const SERVER_URL = process.env.REACT_APP_SERVER_URL ?? "https://speckle.xyz";
const SPECKLE_APP_ID = process.env.REACT_APP_APP_ID ?? "cafc6e9bf6";
const SPECKLE_APP_SECRET = process.env.REACT_APP_APP_SECRET ?? "907563db09";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

// Define the interface
export interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  login: () => void;
  exchangeAccessCode: (accessCode: string) => Promise<void>;
  logOut: () => void;
}


export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Consider setting a longer expiration time for practical use
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login() {

  // Create the session
  const expires = new Date(Date.now() + 10 * 1000);
  const session = await encrypt({ expires });
  // Generate random challenge
  var challenge =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  // Save challenge in localStorage
  cookies().set(CHALLENGE, challenge);
  const redirectUri = `${SERVER_URL}/api/speckle-callback`; // Adjust with your actual redirect URI
  const speckleAuthUrl = `${SERVER_URL}/authn/verify/${SPECKLE_APP_ID}/${challenge}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  redirect(speckleAuthUrl);
  cookies().set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

export async function exchangeAccessCode(accessCode: string): Promise<{ token: string, refreshToken: string }> {
  // Get the token and refreshToken from localStorage
  const [token, setToken] = React.useState(cookies().get(TOKEN));
  const [refreshToken, setRefreshToken] = React.useState(
    cookies().get(REFRESH_TOKEN)
  );

  var res = await fetch(`${SERVER_URL}/auth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessCode: accessCode,
      appId: SPECKLE_APP_ID,
      appSecret: SPECKLE_APP_SECRET,
      challenge: cookies().get(CHALLENGE),
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to exchange access code for tokens');
  }

  const data = await response.json();
  //return { token: data.token, refreshToken: data.refreshToken };


  if (data.token) {
    // If retrieving the token was successful, remove challenge and set the new token and refresh token

    cookies().set(TOKEN, data.token, { secure: true });
    cookies().set(REFRESH_TOKEN, data.refreshToken, { secure: true,     httpOnly: true    });

    cookies().delete(CHALLENGE);
    cookies().set(TOKEN, data.token);
    cookies().set(REFRESH_TOKEN, data.refreshToken);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
  }
};
