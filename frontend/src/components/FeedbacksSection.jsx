import React, { useEffect, useRef, useState } from "react";
import { Star, Quote, Leaf } from "lucide-react";
import api from "../api/axiosInstance";

/* ── Helpers ─────────────────────────────────────── */
const StarRow = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        fill={i <= rating ? "#fbbf24" : "none"}
        style={{ color: i <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)" }}
      />
    ))}
  </div>
);

const formatDate = iso =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/* ── Single card ─────────────────────────────────── */
const FeedbackCard = ({ item }) => (
  <div
    className="relative flex w-80 shrink-0 flex-col gap-4 p-6 select-none"
    style={{
      background:   "linear-gradient(145deg, rgba(13,26,15,0.90) 0%, rgba(9,18,10,0.96) 100%)",
      borderRadius: "20px",
      border:       "1px solid rgba(163,230,53,0.09)",
    }}
  >
    {/* Quote icon */}
    <Quote
      size={20}
      style={{ color: "rgba(163,230,53,0.20)", position: "absolute", top: 18, right: 18 }}
    />

    {/* Stars */}
    <StarRow rating={item.rating} />

    {/* Comment */}
    <p
      className="flex-1 text-sm leading-7 text-white/60"
      style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}
    >
      &ldquo;{item.comments}&rdquo;
    </p>

    {/* Author + date */}
    <div className="flex items-center justify-between border-t border-white/5 pt-3">
      <div>
        <p className="text-[12px] font-bold text-white/80">{item.author}</p>
        <p className="text-[10px] text-white/28">{formatDate(item.submitted_at)}</p>
      </div>
      {/* Rating badge */}
      <div
        className="flex items-center gap-1 rounded-full px-2.5 py-1"
        style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.20)" }}
      >
        <Star size={10} fill="#fbbf24" style={{ color: "#fbbf24" }} />
        <span className="text-[11px] font-black" style={{ color: "#fbbf24" }}>{item.rating}</span>
      </div>
    </div>
  </div>
);

/* ── Skeleton card ───────────────────────────────── */
const SkeletonCard = () => (
  <div
    className="w-80 shrink-0 animate-pulse p-6"
    style={{
      background: "rgba(13,26,15,0.60)",
      borderRadius: "20px",
      border: "1px solid rgba(163,230,53,0.06)",
    }}
  >
    <div className="mb-4 h-3 w-24 rounded-full bg-white/5" />
    <div className="mb-2 h-3 w-full rounded-full bg-white/5" />
    <div className="mb-2 h-3 w-5/6 rounded-full bg-white/5" />
    <div className="mb-4 h-3 w-4/6 rounded-full bg-white/5" />
    <div className="h-3 w-28 rounded-full bg-white/5" />
  </div>
);

/* ── Section ─────────────────────────────────────── */
const FeedbacksSection = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);
  const trackRef                = useRef(null);
  const animRef                 = useRef(null);
  const pausedRef               = useRef(false);
  const posRef                  = useRef(0);

  /* Fetch public feedback */
  useEffect(() => {
    api
      .get("/feedback")
      .then(r => setFeedback(r.data.feedback ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Auto-scroll loop — infinite duplicate track */
  useEffect(() => {
    if (loading || feedback.length === 0) return;
    const track  = trackRef.current;
    if (!track) return;

    const SPEED  = 0.5; // px per frame
    const halfW  = track.scrollWidth / 2;

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= halfW) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [loading, feedback]);

  /* Compute avg rating */
  const avg = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  /* Duplicate cards so loop is seamless */
  const doubled = [...feedback, ...feedback];

  return (
    <section className="w-full overflow-hidden bg-[#050a06] py-20">

      {/* ── Heading ── */}
      <div className="mx-auto mb-12 w-full max-w-350 px-6 md:px-10 xl:px-16">
        <div className="mb-3 flex items-center gap-2">
          <Leaf size={10} className="text-lime-300/50" />
          <span className="text-[9px] font-black uppercase tracking-[0.45em] text-lime-300/50">
            Visitor Voices
          </span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
              What Our <span style={{ color: "#fbbf24" }}>Visitors</span> Say
            </h2>
            <p className="mt-2 text-sm text-white/30">
              Real experiences from people who've walked the sanctuary.
            </p>
          </div>

          {/* Aggregate rating pill */}
          {avg && !loading && (
            <div
              className="flex shrink-0 items-center gap-3 self-start rounded-2xl px-5 py-3 sm:self-auto"
              style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)" }}
            >
              <Star size={20} fill="#fbbf24" style={{ color: "#fbbf24" }} />
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: "#f5dfa0" }}>{avg}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                  {feedback.length} review{feedback.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrolling track ── */}
      {loading ? (
        <div className="flex gap-5 px-6 md:px-10 xl:px-16">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : feedback.length === 0 ? (
        <div className="mx-auto max-w-350 px-6 md:px-10 xl:px-16">
          <p className="text-sm text-white/20">No feedback yet. Be the first to share your experience!</p>
        </div>
      ) : (
        /* Fade edges */
        <div
          className="relative"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          {/* Pause on hover */}
          <div
            className="cursor-grab active:cursor-grabbing"
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
          >
            <div ref={trackRef} className="flex gap-5 will-change-transform" style={{ width: "max-content" }}>
              {doubled.map((item, idx) => (
                <FeedbackCard key={`${item.feedback_id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="mx-auto mt-16 w-full max-w-350 px-6 md:px-10 xl:px-16">
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/8 to-transparent" />
      </div>
    </section>
  );
};

export default FeedbacksSection;
