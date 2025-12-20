"use client";
import React from "react";

import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/tracing-beam";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

export function TracingBeamSection() {
  return (
    <TracingBeam className="px-6 pb-20">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {dummyContent.map((item, index) => (
          <div key={`content-${index}`} className="mb-10">
            <p className={twMerge("text-xl my-4")}>
              {item.title}
            </p>

            <div className="text-md  prose prose-md dark:prose-invert">
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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos provident voluptates reiciendis consequatur laboriosam doloribus fugiat sint, quis cumque animi.
        </p>
      </>
    ),
    badge: "",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
