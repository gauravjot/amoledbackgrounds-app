import {WallpaperImageType, WallpaperPostType} from "../services/wallpaper_type";
import {WALLPAPER_MIN_ALLOWED_HEIGHT, WALLPAPER_MIN_ALLOWED_WIDTH} from "@/appconfig";
import {WALLPAPERS_URL} from "@/constants/wallpaper_options";
import urlJoin from "url-join";

/**
 * Return the processed post data
 * @param post
 * @returns
 */
export function processRedditPost(post: any): WallpaperPostType[] | null {
  const posts: WallpaperPostType[] = [];

  if (post === undefined) {
    throw new Error("Post is undefined");
  }

  // Skip post if it meets certain conditions
  if (skipPost(post)) return null;
  // if post has 'gallery_data' field, it means it's an album
  if (post.gallery_data) {
    const files = post.media_metadata;
    const file_ids = Object.keys(files);
    for (let i = 0; i < file_ids.length; i++) {
      const file = file_ids[i];
      const resolutions = files[file].p;
      const source = files[file].s;
      const source_url = `https://i.redd.it/${file}.png`;
      // check if image size is appropriate
      if (source.x < WALLPAPER_MIN_ALLOWED_WIDTH || source.y < WALLPAPER_MIN_ALLOWED_HEIGHT) {
        continue;
      }
      // Construct the image object
      const image: WallpaperImageType = {
        url: source_url,
        preview_url:
          resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 3, 0)].u) : undefined, // get the 3rd last resolution
        preview_small_url:
          resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 4, 0)].u) : undefined, // get the 4th last resolution
        width: source.x,
        height: source.y,
      };
      // Construct the post object
      const wallpaperPost: WallpaperPostType = {
        id: `${post.id}#${file}`,
        image: image,
        flair: post.link_flair_text,
        title: `${removeParenthesisData(post.title).replace(/[^\x00-\x7F]/g, "")} (${i + 1})`, // remove non-ascii characters
        created_utc: new Date(post.created_utc * 1000), // convert to milliseconds
        domain: post.domain,
        score: post.score,
        over_18: post.over_18,
        author: post.author,
        author_flair: post.author_flair_text,
        postlink: "https://reddit.com" + post.permalink,
        comments: post.num_comments,
        comments_link: urlJoin(WALLPAPERS_URL, "comments", post.id + ".json"),
      };
      posts.push(wallpaperPost);
    }
  } else {
    // check if images exist
    if (!post.preview || !post.preview.images || post.preview.images.length === 0) {
      return null;
    }

    const resolutions = post.preview.images[0].resolutions;
    const source = post.preview.images[0].source;

    if (resolutions === undefined || source === undefined) {
      return null;
    }

    // check if image size is appropriate
    if (source.width < WALLPAPER_MIN_ALLOWED_WIDTH || source.height < WALLPAPER_MIN_ALLOWED_HEIGHT) {
      return null;
    }

    const image: WallpaperImageType = {
      url: htmlDecode(post.url),
      preview_url:
        resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 4, 0)].url) : undefined, // get the 3rd last resolution
      preview_small_url:
        resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 5, 0)].url) : undefined, // get the 4th last resolution
      width: source.width,
      height: source.height,
    };

    // Construct the post object
    const wallpaperPost: WallpaperPostType = {
      id: post.id,
      image: image,
      flair: post.link_flair_text,
      title: removeParenthesisData(post.title).replace(/[^\x00-\x7F]/g, ""), // remove non-ascii characters
      created_utc: new Date(post.created_utc * 1000), // convert to milliseconds
      domain: post.domain,
      score: post.score,
      over_18: post.over_18,
      author: post.author,
      author_flair: post.author_flair_text,
      postlink: "https://reddit.com" + post.permalink,
      comments: post.num_comments,
      comments_link: urlJoin(WALLPAPERS_URL, "comments", post.id + ".json"),
    };
    posts.push(wallpaperPost);
  }

  return posts;
}

/**
 * Decide whether to skip a post based on certain conditions
 * @param post
 * @returns
 */
export function skipPost(post: {over_18: any; title: string; link_flair_text?: string; url: string}) {
  const isImage =
    post.url.endsWith(".jpg") ||
    post.url.endsWith(".png") ||
    post.url.endsWith(".jpeg") ||
    post.url.includes("/gallery/");
  if (!isImage) return true;

  const isBlacklisted =
    post.over_18 ||
    post.title.toLowerCase().includes("request") ||
    post.title.toLowerCase().includes("question") ||
    post.title.toLowerCase().includes("fuck") ||
    post.link_flair_text?.toLowerCase().includes("meta") ||
    post.link_flair_text?.toLowerCase().includes("psa");

  if (isBlacklisted) return true;

  return false;
}

/**
 * Decode HTML. E.g. &amp; to &
 */
export function htmlDecode(input: string): string {
  let output = input.replace(/&amp;/g, "&");
  return output;
}

/**
 * Clean titles by removing parenthesis and data within
 */
export function removeParenthesisData(input: string): string {
  return input.replace(/[\[\(].*?[\]\)]/g, "").trim();
}
