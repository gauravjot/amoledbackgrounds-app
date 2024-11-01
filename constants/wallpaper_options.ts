export const WALLPAPERS_URL = "https://www.reddit.com/r/Amoledbackgrounds";
export const SearchURL = (query: string, page: number, after: string | undefined) =>
  `https://www.reddit.com/r/Amoledbackgrounds/search.json?q=${query}&count=${page * 25}&after=${after}&restrict_sr=1`;
