import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Listing, Bid } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const listing = await Listing.findById(id)
      .populate("sellerId", "name businessName email")
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get bids for this listing
    const bids = await Bid.find({ listingId: id })
      .sort({ amount: -1 })
      .limit(10)
      .populate("bidderId", "name")
      .lean();

    return NextResponse.json({ ...listing, bids });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
