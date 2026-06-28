import React from "react";

/**
 * Centered lime spinner used during data-fetching states.
 * @param {string} label  - Optional text shown below the spinner.
 */
const LoadingSpinner = ({ label = "Loading…" }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <svg className="h-9 w-9 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-20"
          cx="12" cy="12" r="10"
          stroke="#a3e635"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="#a3e635"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-lime-300/50">
        {label}
      </p>
    </div>
  </div>
);

export default LoadingSpinner;
