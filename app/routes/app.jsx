import { useEffect } from "react";
import { Outlet, useLoaderData, useNavigate, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { entitled } from "../plans.server";

import "@shopify/polaris/build/esm/styles.css";

import enTranslations from "@shopify/polaris/locales/en.json";

export const loader = async ({ request }) => {
  // Authenticates with the App Bridge session token (token exchange). An
  // invalid/expired token is handled by the library itself — it answers with
  // a retry/bounce Response that App Bridge resolves with a fresh token.
  const { admin, session } = await authenticate.admin(request);

  // Free-tier defaults; refined from the live subscription below.
  let features = { pageSpeed: false, altText: false };
  try {
    // Subscription state decides which features unlock. Cached per-shop
    // (positive results only) so paying merchants don't pay a Shopify roundtrip
    // on every click; a fresh subscribe still unlocks instantly.
    const state = await getBillingStateCached(admin, session.shop);
    // Entitlement booleans drive which nav items render (Page Speed, Alt Text).
    features = {
      pageSpeed: entitled(state.plan, "pageSpeed"),
      altText: entitled(state.plan, "altText"),
    };
  } catch (e) {
    // Auth Responses (re-auth / retry with a new session token) must reach
    // the library's boundary untouched.
    if (e instanceof Response) throw e;
    // Any other billing error: fall back to the Free tier defaults.
  }

  return { features };
};

export default function App() {
  const { features } = useLoaderData();
  const navigate = useNavigate();

  // App Bridge (loaded in root.jsx) fires `shopify:navigate` when the merchant
  // clicks an item in the admin nav menu; route it through React Router.
  useEffect(() => {
    const handleNavigate = (event) => {
      const href = event.target?.getAttribute?.("href");
      if (href) navigate(href);
    };
    document.addEventListener("shopify:navigate", handleNavigate);
    return () => document.removeEventListener("shopify:navigate", handleNavigate);
  }, [navigate]);

  return (
    <PolarisAppProvider i18n={enTranslations}>
      {/* No hard paywall: a shop without a paid subscription runs on the Free
          tier (see getBillingState), and upgrades happen from the Plan page. */}
      <ui-nav-menu>
        <a href="/app" rel="home">Overview</a>
        <a href="/app/optimize">Compress</a>
        {features?.altText && (
          <a href="/app/alt-text">Alt Writer</a>
        )}
        {features?.pageSpeed && (
          <a href="/app/speed">Speed Lab</a>
        )}
        <a href="/app/plan">Plan</a>
      </ui-nav-menu>
      <Outlet />
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
