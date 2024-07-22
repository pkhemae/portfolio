const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", // Ajouter ce chemin
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // Activer le mode sombre si nécessaire
  plugins: [nextui()], // Ajouter le plugin NextUI
}
