import {CommentsURL} from "@/constants/wallpaper_options";
import axios from "axios";

/**
 * Get the black percentage from the comments of a post by AmoledBot
 * @param post_id
 * @returns
 */
export const getBlackPercentage = async (post_id: string) => {
  return await axios.get(CommentsURL(post_id)).then(response => {
    const comments = response.data[1].data.children;
    let black_percentage = "";

    for (let i = 0; i < comments.length; i++) {
      const author_id = comments[i].data.author_fullname;
      if (author_id === "t2_ezs32dqs") {
        // Percentage format is 00.00%
        const body = comments[i].data.body;
        const percentage = body.match(/\d+\.\d+/);
        if (percentage) {
          black_percentage = percentage[0];
        }
        break;
      }
    }
    return black_percentage;
  });
};
