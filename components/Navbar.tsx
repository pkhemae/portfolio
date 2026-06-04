"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Briefcase, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./Icons";

export default function Navbar() {
  const links = [
    { name: "Accueil", icon: Home, href: "/" },
    { name: "Projets", icon: Briefcase, href: "/#projets" },
    { name: "Github", icon: GithubIcon, href: "https://github.com/pkhemae", external: true },
    { name: "LinkedIn", icon: LinkedinIcon, href: "https://linkedin.com/in/khemaraparc", external: true },
    { name: "Email", icon: Mail, href: "mailto:khemara.parc@etu.univ-nantes.fr", external: true }
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.7, ease: [0.25, 0.25, 0, 1] }}
      className="fixed top-6 left-1/2 z-50 pointer-events-none"
    >
      <div className="relative">
        {/* Fake Shadow using sibling to avoid backdrop-filter bug */}
        <div className="ticket-shape absolute inset-0 bg-black/10 blur-[6px] translate-y-1" />
        
        {/* Background, Blur & Dashed Border */}
        <div className="ticket-shape ticket-blur absolute inset-0 pointer-events-none">
          <div className="absolute inset-1.5 border border-dashed border-neutral-400/60 rounded-[1px]" />
        </div>
        
        <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-4 py-2 relative">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                className="group relative p-2.5 sm:p-3 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <Icon size={18} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                
                {/* Tooltip */}
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}
