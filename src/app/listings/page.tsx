import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Listing } from "@/models";

export const dynamic = "force-dynamic";

interface SearchParams {
  species?: string;
  suburb?: string;
  state?: string;
  pricingType?: string;
}

async function getListings(searchParams: SearchParams) {
  try {
    await dbConnect();

    const query: Record<string, unknown> = { status: "active" };

    if (searchParams.species) {
      query.species = { $regex: searchParams.species, $options: "i" };
    }
    if (searchParams.suburb) {
      query.suburb = { $regex: searchParams.suburb, $options: "i" };
    }
    if (searchParams.state) {
      query.state = searchParams.state;
    }
    if (searchParams.pricingType) {
      query.pricingType = searchParams.pricingType;
    }

    return Listing.find(query)
      .sort({ createdAt: -1 })
      .populate("sellerId", "name businessName")
      .lean();
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return [];
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const listings = await getListings(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Trees</h1>
            <p className="text-gray-600 mt-1">
              Find the perfect tree for your project
            </p>
          </div>
          <Link
            href="/listings/new"
            className="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            List a Tree
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <form className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label
                htmlFor="species"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Species
              </label>
              <input
                type="text"
                id="species"
                name="species"
                defaultValue={params.species}
                placeholder="e.g., Jacaranda"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="suburb"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Suburb
              </label>
              <input
                type="text"
                id="suburb"
                name="suburb"
                defaultValue={params.suburb}
                placeholder="e.g., Bondi"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <select
                id="state"
                name="state"
                defaultValue={params.state}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All States</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="WA">WA</option>
                <option value="SA">SA</option>
                <option value="TAS">TAS</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="pricingType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pricing Type
              </label>
              <select
                id="pricingType"
                name="pricingType"
                defaultValue={params.pricingType}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="fixed">Fixed Price</option>
                <option value="auction">Auction</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing._id.toString()}
                href={`/listing/${listing._id}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-200 relative">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">🌳</span>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {listing.pricingType === "fixed" ? "Fixed Price" : "Auction"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {listing.species} · {listing.suburb}, {listing.state}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-700">
                      {listing.price
                        ? `$${listing.price.toLocaleString()}`
                        : "Make an offer"}
                    </span>
                    <div className="text-sm text-gray-500">
                      {listing.height && <span>{listing.height}m</span>}
                      {listing.height && listing.trunkDiameter && " · "}
                      {listing.trunkDiameter && <span>{listing.trunkDiameter}cm trunk</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trees found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search filters or check back later.
            </p>
            <Link
              href="/listings/new"
              className="inline-block rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              List Your Tree
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
