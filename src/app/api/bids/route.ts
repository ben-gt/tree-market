import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Listing, Bid, User } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { listingId, amount, message, auth0Id, userEmail, userName } = body;

    if (!auth0Id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!listingId || !amount) {
      return NextResponse.json(
        { error: "Listing ID and amount are required" },
        { status: 400 }
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

    // Check listing exists and is active
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Listing is no longer active" },
        { status: 400 }
      );
    }

    if (listing.pricingType !== "auction") {
      return NextResponse.json(
        { error: "This listing does not accept bids" },
        { status: 400 }
      );
    }

    // Check bid amount is higher than current highest
    const highestBid = await Bid.findOne({ listingId })
      .sort({ amount: -1 })
      .lean();

    const currentHighest = highestBid?.amount || listing.price || 0;
    if (amount <= currentHighest) {
      return NextResponse.json(
        { error: `Bid must be higher than $${currentHighest}` },
        { status: 400 }
      );
    }

    const bid = await Bid.create({
      listingId,
      bidderId: user._id,
      amount,
      message,
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}
