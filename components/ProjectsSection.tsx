"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Code } from "lucide-react";

// Les projets fictifs (configurables)
const PROJECTS = [
  {
    id: "1",
    title: "Vintarget",
    shortDescription: "Application CRM pour les revendeurs Vinted.",
    fullDescription: "Vintarget permet aux utilisateurs de gérer leurs ventes sur Vinted de manière centralisée.",
    tags: ["React", "Node.js", "PostgreSQL"],
    rotation: -2,
    color: "bg-emerald-50",
    link: "https://vintarget.fr/",
    github: "#"
  }
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <>
      <section className="mb-16">
        <h2 className="text-neutral-400 text-sm mb-6 font-medium">Projets</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative py-4">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              layoutId={`card-${project.id}`}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              initial={{ rotate: project.rotation }}
              animate={{ rotate: project.rotation }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setSelectedProject(project)}
              className={`p-6 rounded-3xl cursor-pointer border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow ${project.color}`}
              style={{
                // Décalage pour un effet encore plus organique
                marginTop: index % 2 !== 0 ? "2rem" : "0",
              }}
            >
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">{project.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">{project.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/60 border border-neutral-200/50 rounded-md text-xs text-neutral-600 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-40"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 pointer-events-none">
              <motion.div
                layoutId={`card-${selectedProject.id}`}
                className="w-full max-w-lg p-8 sm:p-10 rounded-[2rem] border border-neutral-200 shadow-2xl pointer-events-auto bg-white relative"
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors z-50 p-2"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>

                <div className="relative z-10 pr-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">{selectedProject.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-neutral-100 rounded-md text-xs text-neutral-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-neutral-600 text-base leading-relaxed mb-8">
                    {selectedProject.fullDescription}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {selectedProject.link && selectedProject.link !== "#" && (
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-neutral-800 to-neutral-950 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:from-neutral-700 hover:to-neutral-900 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Voir le projet <ExternalLink size={16} />
                      </a>
                    )}
                    {selectedProject.github && selectedProject.github !== "#" && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Code source <Code size={16} />
                      </a>
                    )}
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
