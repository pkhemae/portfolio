import { Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#0A0A0A] py-8 text-center text-slate-400 text-sm mt-32">
            <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/pkhemae"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <Github className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a
                        href="https://linkedin.com/in/khemara.parc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <Linkedin className="w-5 h-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                </div>
                <p>© {new Date().getFullYear()} Khémara Parc. Tous droits réservés.</p>
            </div>
        </footer>
    );
}
