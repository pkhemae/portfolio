"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";

export default function CvModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bracket-btn text-sm text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 rounded transition-colors duration-150 cursor-pointer"
      >
        [Aperçu de mon CV]
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[80]"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[90] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="w-full max-w-[calc(80vh*0.7071)] max-h-[90vh] rounded-none border border-neutral-300 shadow-2xl pointer-events-auto bg-white relative flex flex-col overflow-hidden font-mono"
              >
                {/* Header (Topbar) */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white/95 backdrop-blur-md z-20 shrink-0 font-mono text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <span className="text-[#1D2DFF] font-medium">[cv.pdf]</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="bracket-btn text-xs text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 transition-colors cursor-pointer"
                      aria-label="Fermer"
                    >
                      [Fermer ✕]
                    </button>
                  </div>
                </div>

                {/* PDF Preview */}
                <div className="w-full bg-white relative rounded-none overflow-y-auto">
                  <Image
                    src="/cv.pdf.png"
                    alt="Aperçu du CV de Khémara Parc"
                    width={2000}
                    height={2828}
                    className="w-full h-auto block"
                  />
                </div>

                {/* Floating Download Button */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                  <a
                    href="/cv.pdf"
                    target="_blank"
                    download
                    className="inline-flex items-center bg-neutral-900 text-white hover:bg-[#1D2DFF] border border-neutral-800 px-4 py-2 text-xs sm:text-sm font-mono shadow-xl transition-colors duration-150 cursor-pointer"
                  >
                    <span>[ Télécharger le CV ]</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
