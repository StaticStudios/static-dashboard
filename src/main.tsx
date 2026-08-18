import {type ReactNode, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router";
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useAuth, useClerk} from "@clerk/clerk-react";
import App from "./app/App.tsx";
import {checkAuthorized, setAuthTokenGetter, setUnauthorizedHandler} from "./app/api/client";
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

/**
 * Wires a 401 API response to Clerk sign-out. When the backend rejects a request as unauthorized
 * (expired session, unlinked/non-staff account), sign out so <SignedOut>/<RedirectToSignIn> takes over.
 */
function ClerkUnauthorizedSync() {
  const { signOut } = useClerk();
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);
  return null;
}

/**
 * Blocks rendering the dashboard until the backend confirms this session is staff-authorized.
 * Prevents a flash of the dashboard for signed-in-but-not-authorized users while sign-out
 * (triggered by the 401 from the authorization check) is still in flight.
 */
function AuthorizedGate({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    let cancelled = false;
    checkAuthorized()
      .then((ok) => {
        if (!cancelled) setAuthorized(ok);
      })
      .catch(() => {
        if (!cancelled) setAuthorized(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return authorized ? <>{children}</> : null;
}

const root = createRoot(document.getElementById("root")!);
root.render(
  clerkKey ? (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkTokenSync />
      <ClerkUnauthorizedSync />
      <SignedIn>
        <AuthorizedGate>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthorizedGate>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
);
