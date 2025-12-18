import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Listing, Bid } from "@/models";
import type { IPickupWindow } from "@/models";
import BidForm from "./BidForm";

export const dynamic = "force-dynamic";

async function getListing(id: string) {
  await dbConnect();

  const listing = await Listing.findById(id)
    .populate("sellerId", "name businessName email")
    .lean();

  if (!listing) return null;

  const bids = await Bid.find({ listingId: id })
    .sort({ amount: -1 })
    .limit(5)
    .populate("bidderId", "name")
    .lean();

  return { ...listing, bids };
}

function formatPickupWindow(pw: IPickupWindow) {
  if (pw.date) {
    const date = new Date(pw.date).toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const time =
      pw.startTime && pw.endTime ? ` (${pw.startTime} - ${pw.endTime})` : "";
    return `${date}${time}`;
  }

  if (pw.startDate && pw.endDate) {
    const start = new Date(pw.startDate).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
    const end = new Date(pw.endDate).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
    return `${start} - ${end}`;
  }

  if (pw.daysOfWeek && pw.daysOfWeek.length > 0) {
    return pw.daysOfWeek.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ");
  }

  return "Flexible";
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const seller = listing.sellerId as { name?: string; businessName?: string; email?: string };
  const highestBid = listing.bids[0]?.amount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/listings" className="hover:text-gray-700">
                Listings
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{listing.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="aspect-[16/9] bg-gray-200">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-9xl">🌳</span>
                  </div>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {listing.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <p className="text-gray-600">
                    {listing.species} · {listing.suburb}, {listing.state}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    listing.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>

              {listing.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Tree Specifications
                  </h2>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Species</dt>
                      <dd className="text-gray-900 font-medium">{listing.species}</dd>
                    </div>
                    {listing.height && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Height</dt>
                        <dd className="text-gray-900 font-medium">{listing.height}m</dd>
                      </div>
                    )}
                    {listing.trunkDiameter && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Trunk Diameter</dt>
                        <dd className="text-gray-900 font-medium">{listing.trunkDiameter}cm</dd>
                      </div>
                    )}
                    {listing.canopyWidth && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Canopy Width</dt>
                        <dd className="text-gray-900 font-medium">{listing.canopyWidth}m</dd>
                      </div>
                    )}
                    {listing.age && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Estimated Age</dt>
                        <dd className="text-gray-900 font-medium">{listing.age} years</dd>
                      </div>
                    )}
                    {listing.healthStatus && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Health</dt>
                        <dd className="text-gray-900 font-medium capitalize">
                          {listing.healthStatus}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Location
                  </h2>
                  <address className="text-gray-600 not-italic">
                    {listing.address}
                    <br />
                    {listing.suburb}, {listing.state} {listing.postcode}
                  </address>
                </div>
              </div>
            </div>

            {/* Pickup Windows */}
            {listing.pickupWindows.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pickup Availability
                </h2>
                <ul className="space-y-3">
                  {listing.pickupWindows.map((pw, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xl">📅</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatPickupWindow(pw)}
                        </div>
                        {pw.notes && (
                          <div className="text-sm text-gray-500 mt-1">{pw.notes}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl p-6 sticky top-6">
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  {listing.pricingType === "fixed" ? "Fixed Price" : "Current Bid"}
                </span>
                <div className="text-3xl font-bold text-green-700">
                  {listing.pricingType === "fixed"
                    ? listing.price
                      ? `$${listing.price.toLocaleString()}`
                      : "Contact for price"
                    : highestBid
                    ? `$${highestBid.toLocaleString()}`
                    : listing.price
                    ? `Starting at $${listing.price.toLocaleString()}`
                    : "No bids yet"}
                </div>
                {listing.pricingType === "auction" && listing.bids.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {listing.bids.length} bid{listing.bids.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {listing.status === "active" && (
                <>
                  {listing.pricingType === "fixed" ? (
                    <div className="space-y-3">
                      <a
                        href="/api/auth/login"
                        className="block w-full text-center rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700"
                      >
                        Contact Seller
                      </a>
                      <p className="text-center text-sm text-gray-500">
                        Sign in to contact the seller
                      </p>
                    </div>
                  ) : (
                    <BidForm
                      listingId={listing._id.toString()}
                      currentHighest={highestBid}
                      startingPrice={listing.price}
                    />
                  )}
                </>
              )}

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold">
                      {seller.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {seller.name || "Anonymous Seller"}
                    </div>
                    {seller.businessName && (
                      <div className="text-sm text-gray-500">
                        {seller.businessName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            {listing.pricingType === "auction" && listing.bids.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Bids
                </h3>
                <ul className="space-y-3">
                  {listing.bids.map((bid, index) => (
                    <li
                      key={bid._id.toString()}
                      className={`flex justify-between items-center ${
                        index === 0 ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      <span className="font-medium">
                        ${bid.amount.toLocaleString()}
                      </span>
                      <span className="text-sm">
                        {new Date(bid.createdAt).toLocaleDateString("en-AU")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
