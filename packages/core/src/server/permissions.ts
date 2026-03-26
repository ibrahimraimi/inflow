"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";

export const isAdmin = async () => {
  try {
    const res = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          organization: ["update", "delete"],
        },
      },
    });

    return !!res?.success;
  } catch (error) {
    console.error("isAdmin check failed:", error);
    return false;
  }
};
