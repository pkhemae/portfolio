"use client";
import React from "react";

import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/tracing-beam";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

export function TracingBeamSection() {
  return (
    <TracingBeam className="px-6">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {dummyContent.map((item, index) => (
          <div key={`content-${index}`} className="mb-10">

            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <span>{item.badge}</span>
            </HoverBorderGradient>

            <p className={twMerge("text-xl my-4")}>
              {item.title}
            </p>

            <div className="text-sm  prose prose-sm dark:prose-invert">
              {item?.image && (
                <img
                  src={item.image}
                  alt="blog thumbnail"
                  height="1000"
                  width="1000"
                  className="rounded-lg mb-10 object-cover"
                />
              )}
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}

const dummyContent = [
  {
    title: "",
    description: (
      <>
        <p>
          Je m'appelle <span className="font-bold">Khémara Parc</span>, étudiant en première année de BUT Informatique à Nantes, je suis passionné par les sciences et les nouvelles technologies. Vous trouverez sur ce site différents projets et contributions que j'ai réalisés en opensource 🧑🏽‍💻
        </p>
      </>
    ),
    badge: "Bonjour 👋🏽",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
