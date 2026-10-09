import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import "./styles/webbit.css";

// Embedded (/app) documents load App Bridge from Shopify's CDN as the FIRST
// script in <head>, so it is active before any app code runs and attaches a
// session token to every request the app makes (Shopify's "session tokens"
// App Store check). Public pages (landing, login) must not load it — outside
// the admin, App Bridge redirects into the Shopify admin.
export const loader = ({ request }) => {
  const { pathname } = new URL(request.url);
  const embedded = pathname === "/app" || pathname.startsWith("/app/");
  // eslint-disable-next-line no-undef
  return { embedded, apiKey: embedded ? process.env.SHOPIFY_API_KEY || "" : "" };
};

// Whether App Bridge is needed only depends on the document's first URL, and
// the script can't be unloaded anyway — no need to re-run on navigation.
export const shouldRevalidate = () => false;

export default function App() {
  const { embedded, apiKey } = useLoaderData() || {};
  return (
    <html lang="en">
      <head>
        {embedded && (
          <>
            <meta name="shopify-api-key" content={apiKey} />
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
          </>
        )}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Poppins:wght@500;600;700&display=swap"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
