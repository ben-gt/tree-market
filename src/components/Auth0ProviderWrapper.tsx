"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  if (!domain || !clientId) {
    console.warn("Auth0 configuration missing. Authentication will not work.");
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
