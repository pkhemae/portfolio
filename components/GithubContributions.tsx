"use client";

import { useEffect, useState, useRef } from "react";
import { GitHubCalendar } from "react-github-calendar";

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
    <div className="w-full flex justify-end" ref={containerRef}>
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
  );
}
