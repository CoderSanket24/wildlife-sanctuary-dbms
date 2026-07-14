import React, { useState } from "react";
import { Star, Send, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axiosInstance";

/* ── Star picker ────────────────────────────────────── */
const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        className="transition-transform hover:scale-110 focus:outline-none"
        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
      >
        <Star
          size={32}
          fill={i <= value ? "#fbbf24" : "none"}
          style={{
            color: i <= value ? "#fbbf24" : "rgba(255,255,255,0.18)",
            filter: i <= value ? "drop-shadow(0 0 6px rgba(251,191,36,0.45))" : "none",
            transition: "all 0.15s ease",
          }}
        />
      </button>
    ))}
    <span className="ml-2 text-sm font-semibold text-white/40">
      {value === 0 ? "Tap to rate" : ["", "Poor", "Fair", "Good", "Great", "Excellent"][value]}
    </span>
  </div>
);

/* ── Success state ──────────────────────────────────── */
const SuccessCard = ({ onAnother }) => (
  <div className="flex flex-col items-center gap-6 py-16 text-center">
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full"
      style={{ background: "rgba(163,230,53,0.10)", border: "1px solid rgba(163,230,53,0.25)" }}
    >
      <CheckCircle size={36} style={{ color: "#a3e635" }} />
    </div>
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight text-white">
        Thank You!
      </h2>
      <p className="mt-2 text-sm text-white/40">
        Your feedback has been submitted and helps us improve the sanctuary experience.
      </p>
    </div>
    <button
      onClick={onAnother}
      className="px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-black transition hover:brightness-110"
      style={{ background: "#a3e635", borderRadius: "8px" }}
    >
      Submit Another
    </button>
  </div>
);

/* ── Main page ──────────────────────────────────────── */
const Feedback = () => {
  const [rating, setRating]       = useState(0);
  const [comments, setComments]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState(null);
  const [hovered, setHovered]     = useState(0);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (comments.trim().length < 10) { setError("Comments must be at least 10 characters."); return; }

    setSubmitting(true);
    try {
      await api.post("/feedback", { rating, comments });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRating(0);
    setComments("");
    setSubmitted(false);
    setError(null);
  };

  const displayRating = hovered || rating;

  return (
    <DashboardLayout>
      <div className="px-6 py-10 md:px-10 xl:px-16">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-lime-300/50">Abhayarnya · Voice</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
            Share Your <span style={{ color: "#fbbf24" }}>Feedback</span>
          </h1>
          <p className="mt-2 text-sm text-white/30">
            Help us improve your wildlife sanctuary experience. Every review matters.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div
              style={{
                background: "linear-gradient(145deg,rgba(13,26,15,0.90) 0%,rgba(9,18,10,0.96) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(163,230,53,0.12)",
              }}
            >
              <SuccessCard onAnother={reset} />
            </div>
          ) : (
            <div
              style={{
                background: "linear-gradient(145deg,rgba(13,26,15,0.90) 0%,rgba(9,18,10,0.96) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(163,230,53,0.12)",
                boxShadow: "0 0 60px rgba(163,230,53,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Top accent bar */}
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,#fbbf24,rgba(251,191,36,0.1),transparent)" }} />

              <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-8">

                {/* ── Rating section ── */}
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.32em] text-white/30">
                    Overall Experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        className="focus:outline-none"
                        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                        style={{ transition: "transform 0.15s ease" }}
                      >
                        <Star
                          size={36}
                          fill={i <= displayRating ? "#fbbf24" : "none"}
                          style={{
                            color: i <= displayRating ? "#fbbf24" : "rgba(255,255,255,0.15)",
                            filter: i <= displayRating ? "drop-shadow(0 0 8px rgba(251,191,36,0.50))" : "none",
                            transform: i <= displayRating ? "scale(1.15)" : "scale(1)",
                            transition: "all 0.15s ease",
                          }}
                        />
                      </button>
                    ))}
                    {displayRating > 0 && (
                      <span className="ml-3 text-sm font-bold" style={{ color: "#fbbf24" }}>
                        {["", "Poor", "Fair", "Good", "Great", "Excellent!"][displayRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Comments section ── */}
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.32em] text-white/30">
                    Your Comments <span className="text-white/20">(min 10 chars)</span>
                  </label>
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    rows={5}
                    placeholder="Tell us about your visit — the animals, staff, facilities, or anything that stood out…"
                    className="w-full resize-none px-4 py-3 text-sm leading-relaxed placeholder-white/18 transition focus:outline-none"
                    style={{
                      background: "rgba(13,26,15,0.60)",
                      border: "1px solid rgba(163,230,53,0.12)",
                      borderRadius: "12px",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "inherit",
                    }}
                    onFocus={e => { e.target.style.borderColor = "rgba(251,191,36,0.40)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(163,230,53,0.12)"; }}
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-white/20">
                      {comments.length} / 500
                    </span>
                  </div>
                </div>

                {/* ── Error banner ── */}
                {error && (
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}
                  >
                    <AlertTriangle size={15} style={{ color: "#f87171", flexShrink: 0 }} />
                    <p className="text-[12px] font-semibold text-red-300">{error}</p>
                  </div>
                )}

                {/* ── Submit button ── */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.28em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: submitting ? "rgba(251,191,36,0.60)" : "#fbbf24", borderRadius: "12px" }}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Feedback
                    </>
                  )}
                </button>

              </form>
            </div>
          )}

          {/* ── Info note ── */}
          <div className="mt-6 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <MessageSquare size={14} style={{ color: "rgba(255,255,255,0.20)", marginTop: "1px", flexShrink: 0 }} />
            <p className="text-[11px] leading-relaxed text-white/22">
              Feedback is reviewed by our admin team to continuously improve visitor experience. Your responses are linked to your account but kept confidential.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Feedback;
