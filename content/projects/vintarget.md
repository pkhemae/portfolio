---
title: "Vintarget"
shortDescription: "Application CRM pour les revendeurs Vinted."
tags: ["NextJS", "Springboot", "PostgreSQL", "Redis"]
rotation: -2
color: "bg-emerald-50"
icon: "Target"
link: "https://vintarget.fr/"
github: "#"
---

![Interface de Vintarget](/vintarget.png)

## Objectif du projet

Vintarget a pour objectif de fournir un outil d'accompagnement tout-en-un aux vendeurs particuliers et professionnels sur Vinted. L'application permet de centraliser la gestion des ventes, analyser les tendances et accéder aux nouvelles annonces les plus rentables instantanément.

## Stack Technique

### Frontend
- **NextJS** : Framework React de référence offrant un rendu hybride (SSR/SSG), idéal pour optimiser les performances de l'application et son référencement (SEO).
- **shadcn/ui** : Collection de composants d'interface modulaires et accessibles (basés sur TailwindCSS), permettant de concevoir une interface moderne, sobre et hautement personnalisable.

### Backend
- **Spring Boot** : Framework Java extrêmement robuste et sécurisé, constituant le cœur de l'architecture backend pour gérer efficacement une logique métier complexe.
- **PostgreSQL** : Base de données relationnelle puissante et fiable, utilisée pour le stockage persistant et structuré des utilisateurs, des abonnements et de l'historique des annonces.
- **Redis** : Système de base de données en mémoire ultra-rapide utilisé pour le cache intensif, indispensable pour traiter et distribuer les nouvelles annonces Vinted en temps réel.