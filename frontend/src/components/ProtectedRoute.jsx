import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps dashboard routes.
 * - While auth is loading  → shows a full-screen wildlife-themed spinner
 * - Not authenticated       → redirects to /signin
 * - Authenticated           → renders the nested <Outlet />
 *
 * Optional: pass `allowedRoles={["ADMIN"]}` to restrict by role.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#050705" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Animated paw-print / spinner */}
          <svg
            className="h-10 w-10 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="#a3e635"
              strokeWidth="3"
            />
            <path
              className="opacity-80"
              fill="#a3e635"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.35em]"
            style={{ color: "rgba(163,230,53,0.6)" }}
          >
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  // Confirmed unauthenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Role guard (optional)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
