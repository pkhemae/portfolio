import React from "react";
import { cn } from "../lib/utils";
import { Spotlight } from "./ui/Spotlight";

function Hero() {
  return (
    <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-white">
          👋 Hey, I am <br /> Khémara Parc
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          18yo FullStack Developer, Designer & Entrepreneur enthusiastic about new technologies. Here you can find my projects, my blog and more.
        </p>
      </div>
    </div>
  );
}

export default Hero;