import {SortOptions} from "@/constants/sort_options";
import {WALLPAPERS_URL} from "../../constants/wallpaper_options";
import urlJoin from "url-join";
import axios from "axios";
import {PaginationType, WallpaperImageType, WallpaperPostType} from "./wallpaper_type";
import {WALLPAPER_MIN_ALLOWED_HEIGHT, WALLPAPER_MIN_ALLOWED_WIDTH, WALLPAPERS_POST_LIMIT} from "@/appconfig";
import * as SqlUtility from "@/lib/utils/sql";

export const getWallpapers = async (
  sort: SortOptions,
  after: string | undefined,
  page_number: number,
  deviceIdentifier: string,
) => {
  const url = urlJoin(
    WALLPAPERS_URL,
    getURIFromSort(sort),
    `?limit=${WALLPAPERS_POST_LIMIT}`,
    after ? `&after=${after}` : "",
    `&count=${WALLPAPERS_POST_LIMIT * (page_number ?? 1)}`,
  );

  return await axios.get(url).then(response => {
    // Process response to get the data we need
    const posts: WallpaperPostType[] = [];

    for (let i = 0; i < response.data.data.children.length; i++) {
      const post = response.data.data.children[i].data;
      if (post === undefined) continue;

      // Skip post if it meets certain conditions
      if (skipPost(post)) continue;

      // if post has 'gallery_data' field, it means it's an album, skip it
      if (post.gallery_data) {
        continue;
      } else {
        // Construct the image object
        try {
          const resolutions = post.preview.images[0].resolutions;
          const source = post.preview.images[0].source;

          // check if images exist
          if (resolutions === undefined || source === undefined) {
            continue;
          }

          // check if image size is appropriate
          if (source.width < WALLPAPER_MIN_ALLOWED_WIDTH || source.height < WALLPAPER_MIN_ALLOWED_HEIGHT) {
            continue;
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
        } catch (error) {
          // Log error
          SqlUtility.insertErrorLog(
            {
              file: "lib/services/get_wallapers.ts[getWallpapers]",
              description: "Error processing post",
              error_title: error instanceof Error ? error.name : "",
              method: "getWallpapers",
              params: JSON.stringify({
                sort: sort,
                after: after,
                page_number: page_number,
                post: post,
              }),
              severity: "error",
              stacktrace: error instanceof Error ? error.stack || error.message : "",
            },
            deviceIdentifier,
          );
          console.log(JSON.stringify(post));
        }
      }
    }
    // Construct pagination object
    const pagination: PaginationType = {
      page_number: page_number ?? 1,
      before: response.data.data.before,
      after: response.data.data.after,
    };

    return {
      posts: posts,
      pagination: pagination,
    };
  });
};

/**
 * Decide whether to skip a post based on certain conditions
 * @param post
 * @returns
 */
export function skipPost(post: {over_18: any; title: string; link_flair_text?: string; url: string}) {
  const isImage = post.url.endsWith(".jpg") || post.url.endsWith(".png") || post.url.endsWith(".jpeg");
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
 * Get URL substring based on provided sort
 * @param sort
 * @returns
 */
export function getURIFromSort(sort: SortOptions) {
  switch (sort) {
    case SortOptions.Hot:
      return "hot.json";
    case SortOptions.New:
      return "new.json";
    case SortOptions["Top 24h"]:
      return "top.json?t=day";
    case SortOptions["Top Week"]:
      return "top.json?t=week";
    case SortOptions["Top Month"]:
      return "top.json?t=month";
    case SortOptions["Top Year"]:
      return "top.json?t=year";
    case SortOptions["Top All"]:
      return "top.json?t=all";
    default:
      return "hot.json";
  }
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
