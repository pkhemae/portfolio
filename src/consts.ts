import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Khémara Parc",
  DESCRIPTION: "Welcome to Astro Sphere, a portfolio and blog for designers and developers.",
  AUTHOR: "Khémara Parc",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "khem@wiregency.com",
    HREF: "mailto:khem@wiregency.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "pkhemae",
    HREF: "https://github.com/pkhemae"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "khemaraparc",
    HREF: "https://www.linkedin.com/in/khemaraparc",
  },
  { 
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "pkhemae",
    HREF: "https://twitter.com/pkhemae",
  },
]

