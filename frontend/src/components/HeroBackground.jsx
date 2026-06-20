import React from "react";
import heroImage from "../assets/image.png";

/**
 * HeroBackground
 * Wraps children in the layered hero background:
 *  1. Dark vignette + hero image (bg-cover)
 *  2. Radial lime-green glow overlays
 *  3. Centred, max-width content column
 */
const HeroBackground = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full overflow-hidden bg-cover bg-center text-white"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(9, 12, 10, 0.88) 0%, rgba(9, 12, 10, 0.62) 48%, rgba(9, 12, 10, 0.88) 100%), url(${heroImage})`,
      }}
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(122,160,40,0.28),transparent_28%),radial-gradient(circle_at_center,rgba(147,210,82,0.12),transparent_35%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-350 flex-col px-6 pb-8 pt-4 md:px-10 xl:px-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HeroBackground;
