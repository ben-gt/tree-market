"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface HeaderProps {
  logoUrl?: string;
}

export default function Header({ logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  // Only show loading briefly, then show login buttons
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check if user is admin (also creates user if first login)
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.sub) return;
      try {
        const params = new URLSearchParams({
          auth0Id: user.sub,
          email: user.email || "",
          name: user.name || "",
        });
        const res = await fetch(`/api/user/me?${params}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin || false);
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    }
    if (isAuthenticated && user?.sub) {
      checkAdmin();
    }
  }, [isAuthenticated, user?.sub, user?.email, user?.name]);

  const stillLoading = isLoading && showLoading;

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleSignup = () => {
    loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <>
    <header className="relative z-50 bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img
                src={logoUrl || "/logo.png"}
                alt="Tree Market"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-green-700">
                Tree Market
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-8">
            <Link
              href="/listings"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Browse Trees
            </Link>
            {isAuthenticated && (
              <Link
                href="/listings/new"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                List a Tree
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Admin
              </Link>
            )}
            {stillLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-gray-600">{user?.name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignup}
                  className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

      </nav>
    </header>

    {mobileMenuOpen && (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="fixed left-0 right-0 top-16 z-50 bg-white border-b border-gray-200 shadow-lg sm:hidden">
          <div className="space-y-2 px-4 py-4">
            <Link
              href="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              Browse Trees
            </Link>
            {isAuthenticated && (
              <Link
                href="/listings/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                List a Tree
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span className="block px-3 py-2 text-base font-medium text-gray-400">
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-green-600 hover:bg-gray-50 rounded-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </>
    )}
    </>
  );
}
