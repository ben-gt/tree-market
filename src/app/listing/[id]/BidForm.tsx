"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface BidFormProps {
  listingId: string;
  currentHighest?: number;
  startingPrice?: number | null;
}

export default function BidForm({
  listingId,
  currentHighest,
  startingPrice,
}: BidFormProps) {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const minimumBid = currentHighest
    ? currentHighest + 1
    : startingPrice
    ? startingPrice
    : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.sub) {
      loginWithRedirect();
      return;
    }

    setLoading(true);
    setError("");

    const bidAmount = parseFloat(amount);
    if (bidAmount < minimumBid) {
      setError(`Minimum bid is $${minimumBid.toLocaleString()}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          amount: bidAmount,
          message: message || undefined,
          auth0Id: user.sub,
          userEmail: user.email,
          userName: user.name,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to place bid");
      }

      setSuccess(true);
      setAmount("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <span className="text-2xl mb-2 block">✓</span>
        <p className="text-green-800 font-medium">Bid placed successfully!</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-sm text-green-600 hover:text-green-700"
        >
          Place another bid
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => loginWithRedirect()}
          className="w-full rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700"
        >
          Sign In to Bid
        </button>
        <p className="text-center text-sm text-gray-500">
          Create an account or sign in to place a bid
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="bid-amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Bid ($)
        </label>
        <input
          type="number"
          id="bid-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={minimumBid}
          step="1"
          required
          placeholder={`Min: $${minimumBid.toLocaleString()}`}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="bid-message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message (optional)
        </label>
        <textarea
          id="bid-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Introduce yourself or ask a question..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Placing Bid..." : "Place Bid"}
      </button>
    </form>
  );
}
