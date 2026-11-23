import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <p className="mono-label">
          <span className="text-signal">404</span>
          <span className="mx-2 text-bone-faint">{"//"}</span>
          Route not found
        </p>
        <h1 className="h2 mt-5 max-w-[18ch]">This endpoint doesn’t exist.</h1>
        <p className="lede mt-5 max-w-[40ch]">The page you’re looking for has moved or was never deployed.</p>
        {/* Full page load on purpose, so the home page boots its scroll system fresh. */}
        <a href="/" className="btn btn-primary mt-9">
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Back to the portfolio
        </a>
      </div>
    </main>
  );
}
