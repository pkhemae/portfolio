"use client";

import { useState } from "react";

interface CopyEmailButtonProps {
  email?: string;
  className?: string;
}

export default function CopyEmailButton({
  email = "khemara.parc@etu.univ-nantes.fr",
  className = "",
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Email copié !" : `Copier ${email}`}
      aria-label="Copier mon adresse email"
      className={`bracket-btn text-sm text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 rounded transition-colors duration-150 cursor-pointer ${className}`}
    >
      {copied ? "[Email copié !]" : "[Copier mon email]"}
    </button>
  );
}
