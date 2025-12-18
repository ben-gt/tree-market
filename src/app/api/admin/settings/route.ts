import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { SiteSettings, User } from "@/models";

export async function GET() {
  try {
    await dbConnect();

    let settings = await SiteSettings.findOne().lean();

    if (!settings) {
      const newSettings = await SiteSettings.create({});
      settings = newSettings.toObject();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { auth0Id, logoUrl, heroTitle, heroDescription, ctaTitle, ctaDescription } = body;

    if (!auth0Id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findOne({ auth0Id });
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Update or create settings
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        logoUrl,
        heroTitle,
        heroDescription,
        ctaTitle,
        ctaDescription,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
