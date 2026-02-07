"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
    toc: { id: string; title: string; level: number }[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        toc.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            toc.forEach((heading) => {
                const element = document.getElementById(heading.id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [toc]);

    return (
        <nav className="sticky top-20 self-start">
            <Link
                href="/"
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors mb-8 text-sm"
            >
                <span>←</span> Index
            </Link>

            <ul className="space-y-3 text-sm">
                {toc.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                    >
                        <a
                            href={`#${heading.id}`}
                            className={`block transition-colors duration-200 ${activeId === heading.id
                                    ? "text-neutral-900 font-medium"
                                    : "text-neutral-400 hover:text-neutral-600"
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(`#${heading.id}`)?.scrollIntoView({
                                    behavior: "smooth",
                                });
                                setActiveId(heading.id);
                            }}
                        >
                            {heading.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
