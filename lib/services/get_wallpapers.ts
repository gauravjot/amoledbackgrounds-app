import {SortOptions} from "@/constants/sort_options";
import {WALLPAPERS_URL} from "../../constants/wallpaper_options";
import axios from "axios";
import {PaginationType, WallpaperPostType} from "./wallpaper_type";
import {WALLPAPERS_POST_LIMIT} from "@/appconfig";
import * as SqlUtility from "@/lib/utils/sql";
import {processRedditPost} from "../utils/process_reddit_post";

export const getWallpapers = async (
  sort: SortOptions,
  after: string | undefined,
  page_number: number,
  deviceIdentifier: string,
) => {
  const url =
    `${WALLPAPERS_URL}/${getURIFromSort(sort)}?limit=${WALLPAPERS_POST_LIMIT}` + after
      ? `&after=${after}`
      : "" + `&count=${WALLPAPERS_POST_LIMIT * (page_number ?? 1)}`;

  return await axios.get(url).then(response => {
    // Process response to get the data we need
    const posts: WallpaperPostType[] = [];

    for (let i = 0; i < response.data.data.children.length; i++) {
      const post = response.data.data.children[i].data;

      try {
        const wallpapers = processRedditPost(post);
        if (wallpapers) {
          for (let j = 0; j < wallpapers.length; j++) {
            const wallpaperPost = wallpapers[j];
            wallpaperPost.flatlistId = posts.length + page_number * WALLPAPERS_POST_LIMIT;
            posts.push(wallpaperPost);
          }
        }
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
