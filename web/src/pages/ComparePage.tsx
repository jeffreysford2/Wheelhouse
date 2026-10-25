import { Link } from "react-router-dom";

// Placeholder route so links and the router are in place. The compare tray
// and side-by-side table arrive in Phase 3.
export function ComparePage() {
  return (
    <div className="page">
      <h1>Compare</h1>
      <p className="muted">Side-by-side comparison of up to six trims is coming soon.</p>
      <Link to="/">Back to all cars</Link>
    </div>
  );
}
