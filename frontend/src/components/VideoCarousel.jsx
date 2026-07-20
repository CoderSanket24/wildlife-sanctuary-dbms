import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play } from "lucide-react";

/*
  ─────────────────────────────────────────────────────────────────────
  VIDEO HOSTING — videos are served from Cloudinary CDN (free tier).
  Local files in public/videos/ are gitignored (too large for GitHub).

  To update URLs:
    1. Upload your MP4s to cloudinary.com (free account)
    2. Copy each file's delivery URL and paste below
  ─────────────────────────────────────────────────────────────────────
*/
const CLOUD = "https://res.cloudinary.com/bbxdwe6u/video/upload";

const videos = [
  {
    id: "v1",
    title: "Elephant Herd at Dawn",
    description: "A magnificent herd crossing the savannah at sunrise.",
    src: `${CLOUD}/elephant_bgxufi.mp4`,
  },
  {
    id: "v2",
    title: "Big Cat Sighting",
    description: "A rare leopard resting on ancient rocks in the sanctuary.",
    src: `${CLOUD}/big-cat_usklxz.mp4`,
  },
  {
    id: "v3",
    title: "Night Safari Experience",
    description: "Nocturnal wonders discovered under the stars with our rangers.",
    src: `${CLOUD}/night-safari_kx5gb5.mp4`,
  },
];

/*
  Layout — active large LEFT, two small stacked RIGHT
    slot 0 = active  (left, large)
    slot 1 = top-right  (small)
    slot 2 = bottom-right (small)
*/
const SLOTS = [
  { left: "0%",  top: "0%",   width: "62%",  height: "100%", zIndex: 3 },
  { left: "65%", top: "0%",   width: "35%",  height: "47%",  zIndex: 2 },
  { left: "65%", top: "53%",  width: "35%",  height: "47%",  zIndex: 1 },
];

const ANIM_MS  = 600;
const CYCLE_MS = 10000;

const CARD_TRANSITION = `
  left   ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  top    ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  width  ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  height ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1),
  border-color ${ANIM_MS}ms ease,
  box-shadow   ${ANIM_MS}ms ease
`.trim();

const VideoCarousel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [liveIdx,   setLiveIdx]   = useState(0);
  const [progress,  setProgress]  = useState(0);

  const activeIdxRef = useRef(0);
  const isAnimRef    = useRef(false);
  const cycleRef     = useRef(null);
  const progressRef  = useRef(null);
  const startTimeRef = useRef(Date.now());
  // refs to each <video> element
  const videoRefs    = useRef([null, null, null]);

  /* ── play the active video, pause others ── */
  const syncPlayback = useCallback((idx) => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === idx) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, []);

  /* ── advance ── */
  const advance = useCallback((nextIdx) => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;
    setLiveIdx(-1);
    setActiveIdx(nextIdx);
    activeIdxRef.current = nextIdx;
    setTimeout(() => {
      setLiveIdx(nextIdx);
      syncPlayback(nextIdx);
      isAnimRef.current = false;
    }, ANIM_MS + 60);
  }, [syncPlayback]);

  /* ── progress bar ── */
  const restartProgress = useCallback(() => {
    clearInterval(progressRef.current);
    setProgress(0);
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTimeRef.current) / CYCLE_MS) * 100, 100));
    }, 50);
  }, []);

  /* ── round-robin cycle ── */
  const startCycle = useCallback(() => {
    clearInterval(cycleRef.current);
    restartProgress();
    cycleRef.current = setInterval(() => {
      const next = (activeIdxRef.current + 1) % videos.length;
      advance(next);
      restartProgress();
    }, CYCLE_MS);
  }, [advance, restartProgress]);

  useEffect(() => {
    setLiveIdx(0);
    syncPlayback(0);
    startCycle();
    return () => {
      clearInterval(cycleRef.current);
      clearInterval(progressRef.current);
    };
  }, [startCycle, syncPlayback]);

  /* ── manual select ── */
  const handleSelect = (idx) => {
    if (idx === activeIdxRef.current || isAnimRef.current) return;
    clearInterval(cycleRef.current);
    advance(idx);
    setTimeout(() => startCycle(), ANIM_MS + 80);
  };

  return (
    <aside className="ml-auto w-full max-w-lg">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">Watch</p>
          <h2 className="mt-0.5 text-2xl font-semibold uppercase tracking-[0.12em] text-lime-300">
            Sanctuary Stories
          </h2>
        </div>
        </div>

      {/* ── Carousel container ── */}
      <div className="relative w-full" style={{ height: "420px" }}>
        {videos.map((video, i) => {
          const slotIdx  = (i - activeIdx + 3) % 3;
          const slot     = SLOTS[slotIdx];
          const isActive = slotIdx === 0;

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
                  ? "border-lime-300/35 shadow-[0_0_48px_rgba(163,230,53,0.16)] ring-1 ring-lime-300/20"
                  : "border-white/10 hover:border-lime-300/25"
              }`}
            >
              {/* Native <video> — instant load, no chrome, no buffering UI */}
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                src={video.src}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity:    isActive ? 1 : 0.45,
                  transition: `opacity ${ANIM_MS}ms ease`,
                }}
              />

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

              {/* ── Active card ── */}
              {isActive && (
                <>
                  {/* Pulsing badge */}
                  <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full border border-lime-300/30 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
                    </span>
                    Now Playing
                  </span>

                  {/* Info + progress */}
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

              {/* ── Inactive card ── */}
              {!isActive && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white/70 backdrop-blur-sm transition hover:border-lime-300/50 hover:text-lime-300">
                      <Play size={12} fill="currentColor" />
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                    <p className="line-clamp-1 text-[9px] font-semibold leading-tight text-white/75">
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
            className={`rounded-full transition-all duration-300 ${
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
