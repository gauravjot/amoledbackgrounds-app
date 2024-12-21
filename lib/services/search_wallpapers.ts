import {SearchURL} from "@/constants/wallpaper_options";
import axios from "axios";
import {PaginationType, WallpaperPostType} from "./wallpaper_type";
import * as SqlUtility from "@/lib/utils/sql";
import {processRedditPost} from "../utils/process_reddit_post";

export const getWallpapersFromSearch = async (
  query: string,
  page: number,
  after: string | undefined,
  deviceIdentifier: string,
) => {
  const url = SearchURL(query, page, after);

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
            posts.push(wallpaperPost);
          }
        }
      } catch (error) {
        // Log error
        SqlUtility.insertErrorLog(
          {
            file: "lib/services/search_wallapers.ts[getWallpapers]",
            description: "Error processing post",
            error_title: error instanceof Error ? error.name : "",
            method: "searchWallpapers",
            params: JSON.stringify({
              query: query,
              after: after,
              page: page,
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
      page_number: page ?? 1,
      before: response.data.data.before,
      after: response.data.data.after,
    };

    return {posts: posts, pagination: pagination};
  });
};
