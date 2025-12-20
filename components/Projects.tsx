"use client";

import { Tabs } from "./ui/tabs";
import { PinContainer } from "./ui/3d-pin";

export function Projects() {
    const tabs = [
        {
            title: "Portfolio",
            value: "portfolio",
            content: (
                <div className="w-full h-full flex items-center justify-center bg-transparent">
                    <PinContainer
                        title="khemaraparc.fr"
                        href="#"
                    >
                        <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
                            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
                                Portfolio
                            </h3>
                            <div className="text-base !m-0 !p-0 font-normal">
                                <span className="text-slate-500 ">
                                    Le site de portfolio sur lequel vous vous trouvez actuellement. Il me permet de présenter les projets sur lesquels j'ai pu travailler.
                                </span>
                            </div>
                        </div>
                    </PinContainer>
                </div>
            ),
        }
    ];

    return (
        <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full items-start justify-start">
            <Tabs tabs={tabs} />
        </div>
    );
}


