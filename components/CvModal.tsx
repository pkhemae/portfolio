"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText } from "lucide-react";
import Image from "next/image";

export default function CvModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
      >
        <FileText size={14} />
        Aperçu de mon CV
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-[calc(80vh*0.7071)] max-h-[90vh] rounded-[2rem] border border-neutral-200 shadow-2xl pointer-events-auto bg-white relative flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/90 backdrop-blur-md z-20 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-neutral-900">Khémara Parc</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-neutral-400 hover:text-neutral-900 transition-colors p-2"
                      aria-label="Fermer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                {/* PDF Preview */}
                <div className="w-full bg-white relative rounded-b-[2rem] overflow-y-auto">
                  <Image 
                    src="/cv.pdf.png" 
                    alt="Aperçu du CV de Khémara Parc"
                    width={2000}
                    height={2828}
                    className="w-full h-auto block"
                  />
                </div>

                {/* Floating Download Button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                  <div className="p-1 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 flex items-center justify-center">
                    <a
                      href="/cv.pdf"
                      target="_blank"
                      download
                      className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="absolute inset-0 w-full h-full bg-neutral-700 [clip-path:circle(0%_at_0%_50%)] group-hover:[clip-path:circle(150%_at_0%_50%)] transition-all duration-700 ease-out" />
                      <span className="relative z-10 flex items-center gap-2">
                        Télécharger <Download size={16} />
                      </span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
