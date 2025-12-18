import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const auth0Id = request.nextUrl.searchParams.get("auth0Id");
    const email = request.nextUrl.searchParams.get("email");
    const name = request.nextUrl.searchParams.get("name");

    if (!auth0Id) {
      return NextResponse.json(
        { error: "auth0Id required" },
        { status: 400 }
      );
    }

    // Upsert user - create if doesn't exist
    const user = await User.findOneAndUpdate(
      { auth0Id },
      {
        $setOnInsert: {
          auth0Id,
          email: email || "",
          name: name || "",
          isAdmin: false,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      isAdmin: user.isAdmin || false,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
