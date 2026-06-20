import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play } from "lucide-react";

const videos = [
  {
    id: "v1",
    title: "Elephant Herd at Dawn",
    description: "A magnificent herd crossing the savannah at sunrise.",
    src: "https://www.youtube.com/embed/bFuvRmTZYo0",
    thumb: "https://img.youtube.com/vi/bFuvRmTZYo0/hqdefault.jpg",
  },
  {
    id: "v2",
    title: "Big Cat Sighting",
    description: "A rare leopard resting on ancient rocks in the sanctuary.",
    src: "https://www.youtube.com/embed/Hm3jh6tFEYk",
    thumb: "https://img.youtube.com/vi/Hm3jh6tFEYk/hqdefault.jpg",
  },
  {
    id: "v3",
    title: "Night Safari Experience",
    description: "Nocturnal wonders discovered under the stars with our rangers.",
    src: "https://www.youtube.com/embed/lfBEXkUaIV4",
    thumb: "https://img.youtube.com/vi/lfBEXkUaIV4/hqdefault.jpg",
  },
];

/*
  Slot layout (percentage of container):
    0 = active  → large card on the left
    1 = top     → small card top-right
    2 = bottom  → small card bottom-right
*/
const SLOTS = [
  { left: "0%",  top: "0%",  width: "61%", height: "100%", zIndex: 3 },
  { left: "64%", top: "0%",  width: "36%", height: "47%",  zIndex: 2 },
  { left: "64%", top: "53%", width: "36%", height: "47%",  zIndex: 1 },
];

const ANIM_MS   = 620;  // card transition duration
const CYCLE_MS  = 8000; // round-robin interval

// CSS transition string used on every positional property
const CARD_TRANSITION = `left ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  top    ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  width  ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  height ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  box-shadow ${ANIM_MS}ms ease,
  border-color ${ANIM_MS}ms ease`;

const VideoCarousel = () => {
  const [activeIdx,      setActiveIdx]      = useState(0);
  const [liveIdx,        setLiveIdx]        = useState(0);  // which card shows iframe
  const [progress,       setProgress]       = useState(0);

  // Refs to avoid stale closures in intervals
  const activeIdxRef   = useRef(0);
  const isAnimRef      = useRef(false);
  const cycleRef       = useRef(null);
  const progressRef    = useRef(null);
  const startTimeRef   = useRef(Date.now());

  /* ── advance to a specific index ── */
  const advance = useCallback((nextIdx) => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;

    // 1. Hide iframe immediately → all cards show thumbnail while animating
    setLiveIdx(-1);
    // 2. Trigger the position animation by updating activeIdx
    setActiveIdx(nextIdx);
    activeIdxRef.current = nextIdx;

    // 3. After animation completes, reveal iframe on new active card
    setTimeout(() => {
      setLiveIdx(nextIdx);
      isAnimRef.current = false;
    }, ANIM_MS + 80);
  }, []);

  /* ── restart progress bar ── */
  const restartProgress = useCallback(() => {
    clearInterval(progressRef.current);
    setProgress(0);
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / CYCLE_MS) * 100, 100));
    }, 50);
  }, []);

  /* ── start round-robin cycle ── */
  const startCycle = useCallback(() => {
    clearInterval(cycleRef.current);
    restartProgress();
    cycleRef.current = setInterval(() => {
      const next = (activeIdxRef.current + 1) % videos.length;
      advance(next);
      restartProgress();
    }, CYCLE_MS);
  }, [advance, restartProgress]);

  /* ── init on mount ── */
  useEffect(() => {
    setLiveIdx(0);
    startCycle();
    return () => {
      clearInterval(cycleRef.current);
      clearInterval(progressRef.current);
    };
  }, [startCycle]);

  /* ── manual click on inactive card ── */
  const handleSelect = (idx) => {
    if (idx === activeIdxRef.current || isAnimRef.current) return;
    clearInterval(cycleRef.current);
    advance(idx);
    // restart cycle from new position after animation
    setTimeout(() => startCycle(), ANIM_MS + 100);
  };

  return (
    <aside className="ml-auto w-full max-w-lg">
      {/* Header */}
      <div className="mb-3">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">Watch</p>
        <h2 className="mt-0.5 text-2xl font-semibold uppercase tracking-[0.12em] text-lime-300">
          Sanctuary Stories
        </h2>
      </div>

      {/* ── Main carousel container (fixed height for absolute layout) ── */}
      <div className="relative w-full" style={{ height: "420px" }}>
        {videos.map((video, i) => {
          const slotIdx = (i - activeIdx + 3) % 3; // 0=active, 1=top, 2=bottom
          const slot    = SLOTS[slotIdx];
          const isActive  = slotIdx === 0;
          const showIframe = liveIdx === i;

          return (
            <div
              key={video.id}
              onClick={() => handleSelect(i)}
              style={{
                position:   "absolute",
                left:       slot.left,
                top:        slot.top,
                width:      slot.width,
                height:     slot.height,
                zIndex:     slot.zIndex,
                transition: CARD_TRANSITION,
                cursor:     isActive ? "default" : "pointer",
              }}
              className={`overflow-hidden rounded-2xl border ${
                isActive
                  ? "border-lime-300/35 shadow-[0_0_48px_rgba(163,230,53,0.18)] ring-1 ring-lime-300/20"
                  : "border-white/10 hover:border-lime-300/25"
              }`}
            >
              {/* Thumbnail — always visible as base layer */}
              <img
                src={video.thumb}
                alt={video.title}
                style={{
                  opacity: isActive ? (showIframe ? 0 : 0.85) : 0.45,
                  transition: `opacity ${ANIM_MS}ms ease`,
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* iframe — only rendered & visible for live (active, post-animation) card */}
              {showIframe && (
                <iframe
                  key={`${video.id}-live`}
                  src={`${video.src}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {/* Bottom gradient */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                style={{ opacity: isActive ? 1 : 0.85 }}
              />

              {/* ── Active card decorations ── */}
              {isActive && (
                <>
                  {/* Pulsing "Now Playing" badge */}
                  <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full border border-lime-300/30 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
                    </span>
                    Now Playing
                  </span>

                  {/* Bottom info + progress */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                    <p className="text-sm font-semibold text-white">{video.title}</p>
                    <p className="mt-0.5 text-xs leading-4 text-white/55 line-clamp-1">{video.description}</p>
                    <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-lime-400"
                        style={{ width: `${progress}%`, transition: "width 50ms linear" }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Inactive card decorations ── */}
              {!isActive && (
                <>
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-lime-300/50 hover:text-lime-300">
                      <Play size={12} fill="currentColor" />
                    </span>
                  </div>
                  {/* Tiny title */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                    <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-white/75">
                      {video.title}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === activeIdx
                ? "h-1.5 w-6 bg-lime-300"
                : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </aside>
  );
};

export default VideoCarousel;
