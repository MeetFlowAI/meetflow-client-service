import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app/App";

// ── Root element guard ──────────────────────────────────────────────────────
// Fail fast with a clear error rather than a cryptic null reference.
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "[MeetFlow] Root element #root not found in index.html. " +
      "Verify that index.html contains <div id='root'></div>."
  );
}

// ── Application mount ───────────────────────────────────────────────────────
// StrictMode is always on — it intentionally double-invokes lifecycle
// functions in development to surface side-effect issues early.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
