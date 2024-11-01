import {SearchURL, WALLPAPERS_URL} from "@/constants/wallpaper_options";
import axios from "axios";
import {PaginationType, WallpaperImageType, WallpaperPostType} from "./wallpaper_type";
import {htmlDecode, removeParenthesisData, skipPost} from "./get_wallpapers";
import {WALLPAPER_MIN_ALLOWED_HEIGHT, WALLPAPER_MIN_ALLOWED_WIDTH} from "@/appconfig";
import urlJoin from "url-join";

export const getWallpapersFromSearch = async (query: string, page: number, after: string | undefined) => {
  const url = SearchURL(query, page, after);

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
              resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 3, 0)].url) : undefined, // get the 3rd last resolution
            preview_small_url:
              resolutions.length > 0 ? htmlDecode(resolutions[Math.max(resolutions.length - 4, 0)].url) : undefined, // get the 4th last resolution
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
        } catch (e) {
          // TODO: Log this error somewhere
          console.log(e);
          console.log(JSON.stringify(post));
        }
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
