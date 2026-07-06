import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clerkId, isSuperAdmin } = await req.json();

    if (!clerkId || typeof isSuperAdmin !== "boolean") {
      return NextResponse.json(
        { error: "clerkId (string) and isSuperAdmin (boolean) are required" },
        { status: 400 },
      );
    }

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      return NextResponse.json(
        { error: "CLERK_SECRET_KEY is not configured" },
        { status: 500 },
      );
    }

    const res = await fetch(
      `https://api.clerk.com/v1/users/${clerkId}/metadata`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: { isSuperAdmin },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("Clerk API error:", res.status, body);
      return NextResponse.json(
        { error: `Clerk API returned ${res.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to sync Clerk role:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
