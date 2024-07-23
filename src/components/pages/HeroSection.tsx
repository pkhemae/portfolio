"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import { Spotlight } from "../ui/Spotlight";

function HeroSection() {
  return (
    <div id="about" className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-white">
          👋 Hey, I am <br /> <span className="bg-gradient-to-r from-blue-200 to-blue-600 bg-clip-text text-transparent">Khémara Parc</span>
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          Entrepreneur & développeur de 18 ans passionné par le développement web et le design, vous trouverez l'ensemble de mes projets et réalisations sur ce site.
        </p>

    <div className="mt-5 flex justify-center text-center">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
      >
        <span>En savoir plus</span>
      </HoverBorderGradient>
    </div>
      </div>
    </div>
  );
}

export default HeroSection;