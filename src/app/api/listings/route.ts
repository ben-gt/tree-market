import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Listing, User } from "@/models";
import type { IPickupWindow } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, unknown> = { status: "active" };

    const species = searchParams.get("species");
    const suburb = searchParams.get("suburb");
    const state = searchParams.get("state");
    const pricingType = searchParams.get("pricingType");

    if (species) query.species = { $regex: species, $options: "i" };
    if (suburb) query.suburb = { $regex: suburb, $options: "i" };
    if (state) query.state = state;
    if (pricingType) query.pricingType = pricingType;

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .populate("sellerId", "name businessName")
      .lean();

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { auth0Id, userEmail, userName } = body;

    if (!auth0Id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await User.findOne({ auth0Id });
    if (!user) {
      user = await User.create({
        auth0Id,
        email: userEmail,
        name: userName,
      });
    }

    const {
      title,
      description,
      species,
      height,
      trunkDiameter,
      canopyWidth,
      healthStatus,
      age,
      address,
      suburb,
      state,
      postcode,
      pricingType,
      price,
      pickupWindows,
      images,
    } = body;

    // Validate required fields
    if (!title || !species || !address || !suburb || !state || !postcode || !pricingType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await Listing.create({
      title,
      description,
      species,
      height,
      trunkDiameter,
      canopyWidth,
      healthStatus,
      age,
      address,
      suburb,
      state,
      postcode,
      pricingType,
      price,
      images: images || [],
      pickupWindows: (pickupWindows || []).map((pw: IPickupWindow) => ({
        type: pw.type,
        date: pw.date ? new Date(pw.date) : undefined,
        startDate: pw.startDate ? new Date(pw.startDate) : undefined,
        endDate: pw.endDate ? new Date(pw.endDate) : undefined,
        startTime: pw.startTime,
        endTime: pw.endTime,
        daysOfWeek: pw.daysOfWeek,
        notes: pw.notes,
      })),
      sellerId: user._id,
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
