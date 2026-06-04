"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

const educationData = [
  { 
    id: 1, 
    degree: "BUT Informatique", 
    school: "Université de Nantes", 
    years: "2025 - 2028" 
  },
  { 
    id: 2, 
    degree: "Baccalauréat STMG", 
    school: "Lycée Beaumont Redon", 
    years: "2022 - 2024" 
  }
];

export default function EducationCards() {
  const [cards, setCards] = useState(educationData);

  const handleCardClick = () => {
    setCards((prev) => {
      const newCards = [...prev];
      newCards.push(newCards.shift()!);
      return newCards;
    });
  };

  return (
    <div className="flex justify-center sm:justify-end py-4">
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[280px] sm:w-[320px] h-[150px] cursor-pointer group" 
        onClick={handleCardClick}
      >
        {cards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              layout
              initial={false}
              animate={{
                top: index * 14,
                x: index * 6,
                rotate: index * -4 + 6,
                scale: 1 - index * 0.04,
                zIndex: cards.length - index,
                opacity: 1 - index * 0.15
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute left-0 w-full bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] origin-bottom-left hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm mb-1">
                    {card.degree}
                  </h3>
                  <p className="text-neutral-500 text-xs">{card.school}</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-neutral-100 shadow-sm text-neutral-500">
                  <GraduationCap size={14} />
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-block px-2.5 py-1 bg-white text-neutral-600 rounded-lg text-[10px] font-semibold tracking-wide border border-neutral-200/60 shadow-sm">
                  {card.years}
                </span>
              </div>
            </motion.div>
          );
        })}
        
        {/* Indicator to click */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Cliquez pour trier les cartes
        </div>
      </motion.div>
    </div>
  );
}
