import {useEffect} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router";
import {ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useAuth, useClerk} from "@clerk/clerk-react";
import App from "./app/App.tsx";
import {setAuthTokenGetter, setUnauthorizedHandler} from "./app/api/client";
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

const root = createRoot(document.getElementById("root")!);
root.render(
  clerkKey ? (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkTokenSync />
      <ClerkUnauthorizedSync />
      <SignedIn>
        <BrowserRouter>
          <App />
        </BrowserRouter>
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
