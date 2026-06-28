import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Red error banner for API/fetch failures.
 * @param {string} message - The error message to display.
 */
const ErrorAlert = ({ message }) => (
  <div
    className="flex items-start gap-3 px-5 py-4"
    style={{
      background: "rgba(239,68,68,0.06)",
      border: "1px solid rgba(239,68,68,0.18)",
      borderRadius: "12px",
    }}
  >
    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
    <p className="text-sm text-red-300">{message}</p>
  </div>
);

export default ErrorAlert;
