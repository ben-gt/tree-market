"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import type { PricingType, HealthStatus, PickupWindowInput, DayOfWeek } from "@/types";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pricingType, setPricingType] = useState<PricingType>("fixed");
  const [pickupWindows, setPickupWindows] = useState<PickupWindowInput[]>([
    { type: "flexible", daysOfWeek: [], notes: "" },
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.sub) {
      setError("You must be logged in to create a listing");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const data = {
      auth0Id: user.sub,
      userEmail: user.email,
      userName: user.name,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      species: formData.get("species") as string,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      trunkDiameter: formData.get("trunkDiameter")
        ? parseFloat(formData.get("trunkDiameter") as string)
        : null,
      canopyWidth: formData.get("canopyWidth")
        ? parseFloat(formData.get("canopyWidth") as string)
        : null,
      healthStatus: (formData.get("healthStatus") as HealthStatus) || null,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      address: formData.get("address") as string,
      suburb: formData.get("suburb") as string,
      state: formData.get("state") as string,
      postcode: formData.get("postcode") as string,
      pricingType,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      pickupWindows,
      images: [],
    };

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create listing");
      }

      const listing = await response.json();
      router.push(`/listing/${listing._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addPickupWindow = () => {
    setPickupWindows([...pickupWindows, { type: "flexible", daysOfWeek: [], notes: "" }]);
  };

  const removePickupWindow = (index: number) => {
    setPickupWindows(pickupWindows.filter((_, i) => i !== index));
  };

  const updatePickupWindow = (index: number, updates: Partial<PickupWindowInput>) => {
    setPickupWindows(
      pickupWindows.map((pw, i) => (i === index ? { ...pw, ...updates } : pw))
    );
  };

  const toggleDay = (index: number, day: DayOfWeek) => {
    const current = pickupWindows[index].daysOfWeek || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    updatePickupWindow(index, { daysOfWeek: updated });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Tree</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to create your listing
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="e.g., Mature Jacaranda - 8m tall, healthy"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe the tree, its condition, why it's being sold..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Tree Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tree Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
                  Species *
                </label>
                <input
                  type="text"
                  id="species"
                  name="species"
                  required
                  placeholder="e.g., Jacaranda mimosifolia"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Health Status
                </label>
                <select
                  id="healthStatus"
                  name="healthStatus"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (meters)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 8.5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="trunkDiameter" className="block text-sm font-medium text-gray-700 mb-1">
                  Trunk Diameter (cm)
                </label>
                <input
                  type="number"
                  id="trunkDiameter"
                  name="trunkDiameter"
                  step="1"
                  min="0"
                  placeholder="e.g., 45"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="canopyWidth" className="block text-sm font-medium text-gray-700 mb-1">
                  Canopy Width (meters)
                </label>
                <input
                  type="number"
                  id="canopyWidth"
                  name="canopyWidth"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 6"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Age (years)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="0"
                  placeholder="e.g., 25"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  placeholder="123 Example Street"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">
                  Suburb *
                </label>
                <input
                  type="text"
                  id="suburb"
                  name="suburb"
                  required
                  placeholder="e.g., Bondi"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select...</option>
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
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  required
                  pattern="[0-9]{4}"
                  placeholder="e.g., 2026"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeRadio"
                    value="fixed"
                    checked={pricingType === "fixed"}
                    onChange={() => setPricingType("fixed")}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Fixed Price</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeRadio"
                    value="auction"
                    checked={pricingType === "auction"}
                    onChange={() => setPricingType("auction")}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Accept Bids</span>
                </label>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  {pricingType === "fixed" ? "Price ($)" : "Starting Bid ($)"}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="1"
                  min="0"
                  placeholder="e.g., 2500"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
                {pricingType === "auction" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Leave blank to accept any offers
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pickup Windows */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pickup Availability
              </h2>
              <button
                type="button"
                onClick={addPickupWindow}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                + Add Window
              </button>
            </div>

            <div className="space-y-6">
              {pickupWindows.map((pw, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`pickupType-${index}`}
                          value="specific"
                          checked={pw.type === "specific"}
                          onChange={() => updatePickupWindow(index, { type: "specific" })}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">Specific Date</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`pickupType-${index}`}
                          value="range"
                          checked={pw.type === "range"}
                          onChange={() => updatePickupWindow(index, { type: "range" })}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">Date Range</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`pickupType-${index}`}
                          value="flexible"
                          checked={pw.type === "flexible"}
                          onChange={() => updatePickupWindow(index, { type: "flexible" })}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">Flexible Days</span>
                      </label>
                    </div>
                    {pickupWindows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePickupWindow(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {pw.type === "specific" && (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={pw.date || ""}
                          onChange={(e) => updatePickupWindow(index, { date: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Time
                        </label>
                        <input
                          type="time"
                          value={pw.startTime || ""}
                          onChange={(e) => updatePickupWindow(index, { startTime: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Time
                        </label>
                        <input
                          type="time"
                          value={pw.endTime || ""}
                          onChange={(e) => updatePickupWindow(index, { endTime: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  )}

                  {pw.type === "range" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={pw.startDate || ""}
                          onChange={(e) => updatePickupWindow(index, { startDate: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={pw.endDate || ""}
                          onChange={(e) => updatePickupWindow(index, { endDate: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  )}

                  {pw.type === "flexible" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(index, day)}
                            className={`px-3 py-1 rounded-full text-sm capitalize ${
                              pw.daysOfWeek?.includes(day)
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={pw.notes || ""}
                      onChange={(e) => updatePickupWindow(index, { notes: e.target.value })}
                      placeholder="e.g., Call before arriving, gate code required"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
