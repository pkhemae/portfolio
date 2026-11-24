export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail?: string;
  content: string;
}

export type AppId = "about" | "projects" | "cv" | "skills" | "github" | "contact" | "terminal" | "post";

export interface WindowState {
  id: string;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** Extra payload (e.g. post slug for the "post" app). */
  payload?: string;
}

export interface OSContextValue {
  posts: PostSummary[];
  openApp: (app: AppId, payload?: string) => void;
  compact: boolean;
}
