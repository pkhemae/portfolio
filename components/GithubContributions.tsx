"use client";

import { useEffect, useState, useRef } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { ArrowUpRight } from "lucide-react";

export default function GithubContributions() {
  const [daysToShow, setDaysToShow] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // La légende à gauche (Mon, Wed, Fri) prend environ 40-50px
        const availableWidth = width - 50;
        // Chaque colonne prend blockSize (14) + blockMargin (4) = 18px
        const columns = Math.max(1, Math.floor(availableWidth / 18));
        setDaysToShow(columns * 7);
      }
    };

    // Calculer la largeur immédiatement au montage
    updateWidth();

    // Recalculer lors d'un redimensionnement (avec un délai pour éviter de spammer l'API)
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 500);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full relative group rounded-xl overflow-hidden" ref={containerRef}>
      <div className="flex justify-end p-2">
        {daysToShow !== null ? (
          <GitHubCalendar 
            key={daysToShow} // La clé force le composant à se recharger si le nombre de jours change
            username="pkhemae" 
            colorScheme="light" 
            blockSize={14}
            blockMargin={4}
            transformData={(data) => data.slice(-daysToShow)}
          />
        ) : (
          // Placeholder le temps de mesurer la largeur
          <div className="h-[130px] w-full" />
        )}
      </div>

      <a 
        href="https://github.com/pkhemae" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[3px] bg-white/40 transition-opacity duration-300 cursor-pointer"
      >
        <span className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium group-hover/btn:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 transform translate-y-2 group-hover:translate-y-0 duration-300">
          Voir sur GitHub <ArrowUpRight size={18} />
        </span>
      </a>
    </div>
  );
}
