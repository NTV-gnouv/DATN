export type PageBlock = {
  type: string;
  [key: string]: unknown;
};

export type LandingPage = {
  id: string;
  title: string;
  slug: string;
  username?: string;
  status?: string;
  template?: string;
  themeId?: string;
  blocks?: PageBlock[];
  createdAt?: string;
};

export type PageDraft = {
  title: string;
  slug: string;
  username: string;
  ownerId?: string;
  template?: string;
  themeId?: string;
};