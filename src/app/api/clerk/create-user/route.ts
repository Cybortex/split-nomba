import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clerkClient();

    // Use matric number if password is provided, otherwise generate a secure temporary password
    const temporaryPassword = password || "Split@" + Math.random().toString(36).slice(-8) + "1!";

    // Create user in Clerk
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password: temporaryPassword,
    });

    return NextResponse.json({
      success: true,
      clerkId: clerkUser.id,
      temporaryPassword,
    });
  } catch (err: any) {
    console.error("Clerk user creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create user in Clerk" },
      { status: 500 }
    );
  }
}
