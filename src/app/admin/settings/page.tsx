"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";

interface Settings {
  logoUrl?: string;
  heroTitle: string;
  heroDescription: string;
  ctaTitle: string;
  ctaDescription: string;
}

export default function AdminSettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [settings, setSettings] = useState<Settings>({
    logoUrl: "",
    heroTitle: "",
    heroDescription: "",
    ctaTitle: "",
    ctaDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings({ ...settings, logoUrl: base64 });
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logoUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            logoUrl: data.logoUrl || "",
            heroTitle: data.heroTitle || "",
            heroDescription: data.heroDescription || "",
            ctaTitle: data.ctaTitle || "",
            ctaDescription: data.ctaDescription || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth0Id: user?.sub,
          ...settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Admin Settings</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>

                {settings.logoUrl ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={settings.logoUrl}
                        alt="Logo preview"
                        className="h-16 w-auto object-contain border border-gray-200 rounded-lg p-2 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove logo
                      </button>
                    </div>
                  </div>
                ) : null}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload an image (PNG, JPG, SVG). Max 2MB. Leave empty for default logo.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="heroTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hero Title
                  </label>
                  <input
                    type="text"
                    id="heroTitle"
                    value={settings.heroTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, heroTitle: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="heroDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hero Description
                  </label>
                  <textarea
                    id="heroDescription"
                    value={settings.heroDescription}
                    onChange={(e) =>
                      setSettings({ ...settings, heroDescription: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Call to Action Section
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ctaTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CTA Title
                  </label>
                  <input
                    type="text"
                    id="ctaTitle"
                    value={settings.ctaTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, ctaTitle: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ctaDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CTA Description
                  </label>
                  <textarea
                    id="ctaDescription"
                    value={settings.ctaDescription}
                    onChange={(e) =>
                      setSettings({ ...settings, ctaDescription: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
