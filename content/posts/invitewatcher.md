---
title: "InviteWatcher : Développement d'un bot Discord public"
date: "27/10/2026"
description: "Comment j'ai développé mon bot Discord InviteWatcher : monorepo Turborepo, stack technique, déploiement et refonte future avec une API AdonisJS."
thumbnail: "/invitewatcher/invitewatcher-og.png"
---

![Miniature de l'article](/invitewatcher/invitewatcher-og.png)

Consulter le [site web](https://invitewatcher.com/).

## Présentation du projet

**InviteWatcher**, c'est un bot Discord public que je développe depuis plusieurs mois sur mon temps libre. L'idée de départ est assez simple : donner aux gérants de serveurs Discord des outils fiables pour suivre leur croissance, savoir d'où viennent leurs membres et animer leur communauté.

Le bot propose plusieurs fonctionnalités principales :

- **Le tracking d'invitations** : savoir précisément quel lien a été utilisé quand quelqu'un rejoint le serveur, détecter les faux comptes ou les personnes qui quittent tout de suite (*fake invites*), et tenir un compteur d'invitations propre.
- **Des messages de bienvenue automatisés** : envoi d'embeds personnalisés avec des variables (le pseudo de l'arrivant, qui l'a invité, le nombre total de membres, etc.).
- **Un système de giveaways** : organisation de tirages au sort avec des conditions d'entrée (rôles requis, tickets bonus selon l'activité).
- **Des classements** : leaderboards pour récompenser les meilleurs inviteurs et les membres les plus actifs.

L'objectif, c'était d'aller au bout d'un vrai projet complet : coder le bot, concevoir un site web vitrine, et mettre en place une infrastructure qui tient la route.

## Un monorepo avec Turborepo

Pour ne pas m'éparpiller avec trois dépôts GitHub différents, j'ai regroupé tout le code dans un seul **monorepo avec [Turborepo](https://turbo.build/)**.

Dans le projet, on retrouve :
- Le bot Discord
- Le site web / dashboard
- Des packages partagés pour la configuration TypeScript et les types communs

C'est vraiment pratique au quotidien : quand je modifie un type ou une structure de données, c'est directement synchronisé entre le bot et le frontend. En plus, Turborepo met en cache les étapes de build et de lint, donc tout s'exécute plus vite.

## La stack technique actuelle

### Le bot : Discord.js et discordx

Pour développer le bot, j'utilise **TypeScript** avec la librairie **Discord.js** et le framework **[discordx](https://github.com/discordx-ts/discordx)**.

Quand un bot commence à avoir beaucoup de fonctionnalités, gérer les slash commands et les événements directement avec Discord.js devient vite le bazar. `discordx` permet d'utiliser des décorateurs TypeScript (`@Discord()`, `@Slash()`, `@On()`) :
- Chaque commande a son propre fichier.
- Le code est beaucoup plus lisible et facile à modifier.
- L'injection de dépendances permet de découper proprement les différents services du bot.

### La base de données : PostgreSQL

Pour stocker les données, je suis parti sur **PostgreSQL**.

Comme il y a des relations claires entre les serveurs, les membres et les liens d'invitations créés, une base relationnelle était le choix le plus logique. Ça me garantit que les données restent cohérentes (avec les clés étrangères et les contraintes) et que les compteurs ne se désynchronisent pas lors des arrivées massives sur un serveur.

### Le site web : TanStack Start et shadcn/ui

Pour la vitrine et l'interface utilisateur, j'ai choisi :
- **[TanStack Start](https://tanstack.com/start)** : un framework fullstack récent avec un système de routes entièrement typé et des fonctions serveur légères.
- **shadcn/ui** et **Tailwind CSS** : pour avoir une interface moderne, propre et accessible sans perdre de temps à réinventer des composants de zéro.
- **Cloudflare** : le site est déployé directement sur le réseau serverless de Cloudflare, ce qui le rend ultra rapide à charger.
- **Cache Redis avec [Upstash](https://upstash.com/)** : pour éviter de taper dans la base de données à chaque chargement de page sur le dashboard, j'utilise une instance Redis serverless chez Upstash. C'est parfait avec Cloudflare car les requêtes passent par une API HTTP très rapide sans devoir maintenir une connexion TCP persistante.

## Hébergement et déploiement avec Coolify

Pour héberger le bot et la base de données, je n'avais pas envie de payer un abonnement mensuel élevé sur des plateformes comme Heroku ou Vercel. J'ai donc installé **Coolify** sur un VPS.

Coolify est une alternative open-source auto-hébergée qui s'occupe de gérer les conteneurs Docker, les certificats SSL et les variables d'environnement. J'ai connecté mon dépôt GitHub à Coolify : dès que je push sur la branche principale, le pipeline de CI/CD vérifie le code et redéploie le bot automatiquement sans coupure.

## Mon workflow de dev

Ce projet étant conséquent, j'ai réfléchi à comment organiser mon travail.

1. **Linear** : je note toutes mes idées de fonctionnalités, les bugs à corriger et je priorise ce que je dois faire dans les prochaines semaines.
2. **GitHub** : je ne code jamais directement sur la branche principale. Je crée une branche pour chaque fonctionnalité et j'ouvre une Pull Request.
3. **Review assistée par IA** : j'utilise l'IA pour relire mes PR, repérer les erreurs d'inattention, les oublis de typage ou les cas particuliers que je n'aurais pas vus.
4. **Déploiement automatique** : une fois la PR validée et mergée, le code part directement en prod.

## Projets futurs : rendre l'architecture plus scalable

Aujourd'hui, le projet tourne bien, mais l'architecture actuelle montre déjà ses limites : **le bot Discord et le dashboard communiquent tous les deux directement avec la base de données PostgreSQL**.

Ce fonctionnement pose plusieurs soucis à mesure que le bot gagne en utilisateurs :
- La logique métier et les requêtes SQL sont dupliquées entre le bot et le dashboard.
- Le nombre de connexions ouvertes sur PostgreSQL augmente trop vite.
- Si je veux ajouter d'autres services plus tard, je devrai encore réécrire les mêmes requêtes.

### Centraliser avec une API AdonisJS

Pour régler ça et rendre le projet réellement scalable, mon prochain gros chantier est de concevoir une **API backend centrale avec [AdonisJS](https://adonisjs.com/)**.

L'idée est de faire transiter l'ensemble des données par cette API :

![Illustration architecture actuelle](/invitewatcher/architecture.png)

En plaçant l'API au centre :
- **Logique centralisée** : toute la gestion des permissions, calculs et règles métier seront gérées à un seul endroit.
- **Scalabilité** : le bot et le frontend deviendront de simples clients qui appellent l'API via des routes REST ou des WebSockets, ce qui permettra de faire monter le nombre de serveurs sans saturer PostgreSQL.
etc..