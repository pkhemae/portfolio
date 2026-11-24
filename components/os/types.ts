export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail?: string;
  content: string;
}

export type AppId = "finder" | "safari" | "notes" | "preview" | "mail" | "terminal" | "activity" | "about";

export interface WindowState {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** App specific location (Finder folder, Safari page, note id…). */
  payload?: string;
  /** Bumped each time the app is asked to open `payload`, even if unchanged. */
  nav: number;
}

/** Actions every app can use. */
export interface OSApi {
  posts: PostSummary[];
  compact: boolean;
  dark: boolean;
  openApp: (app: AppId, payload?: string) => void;
  toggleLamp?: () => void;
  leave?: () => void;
}
