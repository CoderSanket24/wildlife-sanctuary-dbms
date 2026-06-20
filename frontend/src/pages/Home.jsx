import React from "react";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";
import HeroContent from "../components/HeroContent";
import HeroTagline from "../components/HeroTagline";
import VideoCarousel from "../components/VideoCarousel";

const Home = () => {
  return (
    <HeroBackground>
      <Navbar />

      <main className="flex flex-1 items-center py-10 lg:py-14">
        <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <HeroContent />
          <VideoCarousel />
        </div>
      </main>

      <HeroTagline />
    </HeroBackground>
  );
};

export default Home;
