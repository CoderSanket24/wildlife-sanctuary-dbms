import React from "react";

const HeroContent = () => {
  return (
    <section className="max-w-2xl">
      {/* Eyebrow */}
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-lime-300/90 md:text-base">
        Exclusive wildlife experiences for your plans
      </p>

      {/* Brand name heading */}
      <h1 className="max-w-xl text-5xl font-black uppercase leading-[0.86] tracking-tighter text-white md:text-7xl xl:text-[7rem]">
        <span className="inline-grid grid-cols-[auto_auto] items-stretch gap-x-3 md:gap-x-4">
          {/* Large "A" */}
          <span className="relative flex h-full items-start -translate-y-1 text-[1.55em] font-black leading-none text-lime-300 drop-shadow-[0_0_28px_rgba(163,230,53,0.22)] md:-translate-y-1 md:text-[1.7em] xl:text-[1.8em]">
            A
            <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-linear-to-r from-lime-300/90 via-emerald-300/60 to-transparent" />
          </span>
          {/* "bhay" + "rnya" stacked */}
          <span className="flex flex-col justify-center self-stretch py-[0.04em] leading-none md:py-0">
            <span className="text-white">bhay</span>
            <span className="-mt-1 text-lime-400">rnya</span>
          </span>
        </span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-xl text-base leading-7 text-white/80 md:text-lg">
        Our sanctuary blends conservation, exploration, and responsible travel
        into one immersive experience. From forest walks to expert-led safaris,
        every visit is designed to feel close to nature.
      </p>

      {/* Sub-tagline */}
      <p className="mt-4 text-sm font-medium uppercase tracking-[0.28em] text-white/90 md:text-base">
        Protected trails, curated sightings, and seamless guest support
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href="#visit"
          className="border border-lime-400/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-lime-400 hover:text-black"
        >
          Plan a Visit
        </a>
        <a
          href="#learn"
          className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70 transition hover:text-white"
        >
          Learn more
        </a>
      </div>
    </section>
  );
};

export default HeroContent;
