export type WallpaperPostType = {
  id: string;
  image: WallpaperImageType;
  flair: string;
  title: string;
  created_utc: Date;
  domain?: string;
  score?: number;
  over_18?: boolean;
  author?: string;
  author_flair?: string;
  postlink?: string;
  comments?: string;
  comments_link?: string;
};

export type WallpaperImageType = {
  url: string;
  preview_url?: string;
  preview_small_url?: string;
  width: number;
  height: number;
};

export type PaginationType = {
  page_number: number;
  before?: string;
  after?: string;
};

export type RedditCommentType = {
  id: string;
  author: string;
  body: string;
  score: number;
  author_flair: string;
  comment_link: string;
  parent_id: string;
  created_utc: string;
};
