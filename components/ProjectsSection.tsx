"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

import { Project } from "../lib/projects";

const getLucideIcon = (iconName: string) => {
  if (LucideIcons[iconName as keyof typeof LucideIcons]) {
    return LucideIcons[iconName as keyof typeof LucideIcons];
  }
  
  const pascalCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
    
  return LucideIcons[pascalCaseName as keyof typeof LucideIcons] || LucideIcons.Folder;
};

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      // Check initially when modal opens
      setTimeout(checkScroll, 50);
    } else {
      setIsScrolledToBottom(false);
    }
  }, [selectedProject]);

  return (
    <>
      <section className="mb-16" id="projets">
        <h2 className="text-neutral-400 text-sm mb-6 font-medium">Projets</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative py-4">
          {projects.map((project, index) => {
            const ProjectIcon = project.icon ? getLucideIcon(project.icon) as React.ElementType : null;
            
            return (
              <motion.div
                key={project.id}
                layoutId={`card-${project.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, rotate: project.rotation }}
                whileHover={{ scale: 1.02, rotate: 0, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setSelectedProject(project)}
                className={`p-6 rounded-3xl cursor-pointer border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/card ${project.color}`}
                style={{
                  marginTop: index % 2 !== 0 ? "2rem" : "0",
                }}
              >
                {ProjectIcon && (
                  <div className="absolute -bottom-6 -right-6 text-neutral-900/[0.03] group-hover/card:text-neutral-900/[0.06] group-hover/card:scale-110 group-hover/card:-rotate-12 transition-all duration-500 pointer-events-none">
                    <ProjectIcon size={160} strokeWidth={1} />
                  </div>
                )}
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">{project.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">{project.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/60 border border-neutral-200/50 rounded-md text-xs text-neutral-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
              className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-[60]"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[70] pointer-events-none">
              <motion.div
                layoutId={`card-${selectedProject.id}`}
                className="w-full max-w-lg rounded-[2rem] border border-neutral-200 shadow-2xl pointer-events-auto bg-white relative max-h-[70vh] flex flex-col overflow-hidden"
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors z-50 p-2 bg-white/80 rounded-full backdrop-blur-sm"
                  aria-label="Fermer"
                >
                  <LucideIcons.X size={24} />
                </button>

                {/* En-tête collant (sticky) */}
                <div className="px-8 pt-8 sm:px-10 sm:pt-10 pb-4 border-b border-neutral-100 z-20 bg-white/90 backdrop-blur-md shrink-0">
                  <div className="pr-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">{selectedProject.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 rounded-md text-xs text-neutral-600 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenu scrollable */}
                <div 
                  className="px-8 pb-8 sm:px-10 sm:pb-10 pt-6 overflow-y-auto relative z-10 flex-1"
                  ref={scrollContainerRef}
                  onScroll={checkScroll}
                >
                  <div 
                    className="prose prose-sm prose-neutral text-neutral-600 mb-6 max-w-none prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto prose-img:max-h-[500px] prose-img:w-auto"
                    dangerouslySetInnerHTML={{ __html: selectedProject.contentHtml }}
                  />

                  <div className="flex flex-wrap gap-4">
                    {selectedProject.link && selectedProject.link !== "#" && (
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="absolute inset-0 w-full h-full bg-neutral-700 [clip-path:circle(0%_at_0%_50%)] group-hover:[clip-path:circle(150%_at_0%_50%)] transition-all duration-700 ease-out" />
                        <span className="relative z-10 flex items-center gap-2">
                          Voir le projet <LucideIcons.ExternalLink size={16} />
                        </span>
                      </a>
                    )}
                    {selectedProject.github && selectedProject.github !== "#" && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Code source <LucideIcons.Code size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Dégradé en bas pour indiquer le scroll */}
                <div className={`absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-20 rounded-b-[2rem] transition-opacity duration-300 ${isScrolledToBottom ? 'opacity-0' : 'opacity-100'}`} />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
