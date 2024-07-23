"use client";
import React from "react";
import { Button, Link, Image } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "../ui/tracing-beam";

export function StorySection() {
  return (
    <TracingBeam className="px-6">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {dummyContent.map((item, index) => (
          <div key={`content-${index}`} className="mb-10">
            <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
              {item.badge}
            </h2>

            <p className={("text-xl mb-4")}>
              {item.title}
            </p>

            <div className="text-sm  prose prose-sm dark:prose-invert">
              {item?.image && (
                <Image
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
    title: (<><p className="font-black text-4xl bg-gradient-to-r from-blue-200 to-blue-600 bg-clip-text text-transparent">Qui suis-je ?</p></>),
    description: (
      <>
        <Image
            src="https://cdn.discordapp.com/attachments/1025050622485086228/1265357840009265162/ddcecb54f40bd7636603dde6c2b14984_3_1.jpeg?ex=66a137d2&is=669fe652&hm=88181ae7e11bc5a13b54b2951190605b8a7bef5740c5161dbb9a21baca35e660&"
            className={"md:float-left rounded-lg mr-5 pt-4 mb-16"}
            width="300"
        />
        <p className="text-md md:text-lg mt-5 space-y-2">
          Je m'appelle Khémara Parc, j'ai 18 ans et je suis passionné par le développement web et le design. Entreprendre est ma passion, une passion qui m'a poussé à développer de nombreuses compétences.<br/>
          Je me concentre principalement sur le développement d'applications <span className="text-blue-400">frontend</span> et le design d'<span className="text-blue-400">interfaces utilisateur</span>.
        </p>

        <Link href={'https://x.com/pkhemae'} target={'_blank'}>
            <Button className="mt-3" color="primary" variant="bordered">
                Me contacter
            </Button>  
        </Link>
      </>
    ),
    badge: (<><p className="py-2 px-3 border-2 border-gray-600 rounded-full">Entrepreneur & Développeur</p></>),
  },
  {
    title: (<><p className="font-black text-6xl bg-gradient-to-r from-green-500 to-green-900 bg-clip-text text-transparent">Vintarget</p></>),
    description: (
      <>
        <p className="text-lg">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam voluptatum enim qui nesciunt vero alias temporibus molestiae odio consectetur, voluptatem cumque omnis rem ipsum et dolore iusto placeat at quis dolorem nobis, reprehenderit est earum ex quos? Minus similique officia assumenda adipisci totam veniam quod! Et nisi rerum eaque illo eligendi accusantium, labore fugit nesciunt ut, facilis quisquam ipsam harum.
        </p>
      </>
    ),
    badge: (<><p className="mt-16 py-2 px-3 border-2 border-gray-600 rounded-full">SaaS</p></>),
    image:
      "https://maxencebombeeck.fr/assets/realisations/vintarget.png",
  },
];