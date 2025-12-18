import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Listing } from "@/models";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getRecentListings() {
  try {
    await dbConnect();
    return Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("sellerId", "name businessName")
      .lean();
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return [];
  }
}

export default async function Home() {
  const [listings, settings] = await Promise.all([
    getRecentListings(),
    getSiteSettings().catch(() => null),
  ]);

  const heroTitle = settings?.heroTitle || "Find Your Perfect Tree";
  const heroDescription =
    settings?.heroDescription ||
    "Connect with property owners, demolition sites, and tree sellers. Quality ex-ground stock for landscape architects, developers, and enthusiasts.";
  const ctaTitle = settings?.ctaTitle || "Ready to Get Started?";
  const ctaDescription =
    settings?.ctaDescription ||
    "Whether you have trees to sell or are looking for the perfect specimen, Tree Market connects you with the right people.";

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 text-xl text-green-100 max-w-2xl mx-auto">
              {heroDescription}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings"
                className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-green-700 hover:bg-green-50"
              >
                Browse Trees
              </Link>
              <Link
                href="/listings/new"
                className="rounded-full border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white/10"
              >
                List Your Tree
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                List Your Tree
              </h3>
              <p className="text-gray-600">
                Upload photos, add measurements, set your price or accept bids,
                and specify pickup availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect with Buyers
              </h3>
              <p className="text-gray-600">
                Landscape architects, developers, and enthusiasts browse
                listings and make offers on trees they want.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚛</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Arrange Pickup
              </h3>
              <p className="text-gray-600">
                Coordinate pickup during your specified windows. Buyers handle
                extraction and transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Who Uses Tree Market
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Landscape Architects
              </h3>
              <p className="text-gray-600 text-sm">
                Source mature, established trees for commercial and residential
                projects.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Property Developers
              </h3>
              <p className="text-gray-600 text-sm">
                Find quality trees to add instant character and value to new
                developments.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Demolition Companies
              </h3>
              <p className="text-gray-600 text-sm">
                List trees from demolition sites instead of destroying them.
                Sustainable and profitable.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tree Enthusiasts
              </h3>
              <p className="text-gray-600 text-sm">
                Discover unique specimens for private gardens and collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Recent Listings
            </h2>
            <Link
              href="/listings"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View all →
            </Link>
          </div>

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
                      {listing.height && (
                        <span className="text-sm text-gray-500">
                          {listing.height}m tall
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <span className="text-6xl mb-4 block">🌱</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No listings yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to list a tree on Tree Market!
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {ctaTitle}
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/auth/login?screen_hint=signup"
              className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-green-700 hover:bg-green-50"
            >
              Create Account
            </a>
            <Link
              href="/listings"
              className="rounded-full border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white/10"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl">🌳</span>
              <span className="text-xl font-bold text-white">Tree Market</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © {new Date().getFullYear()} Tree Market. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
