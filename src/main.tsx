import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import App from "./app/App.tsx";
import { setAuthTokenGetter } from "./app/api/client";
import "./styles/index.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Wires the API client's token getter to Clerk's session token. Clerk's getToken() returns a
 * cached, auto-refreshed JWT, so calling it per request keeps the Authorization header valid.
 */
function ClerkTokenSync() {
  const { getToken, isSignedIn } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(async () => (isSignedIn ? await getToken() : null));
    return () => setAuthTokenGetter(null);
  }, [getToken, isSignedIn]);
  return null;
}

const root = createRoot(document.getElementById("root")!);
root.render(
  clerkKey ? (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkTokenSync />
      <App />
    </ClerkProvider>
  ) : (
    <App />
  )
);
