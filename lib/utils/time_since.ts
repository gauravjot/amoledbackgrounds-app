/**
 * Take a date and return a string representing the time since that date
 * @param date
 */
export function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  } else if (interval === 1) {
    return "an year ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  } else if (interval === 1) {
    return "a month ago";
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  } else if (interval === 1) {
    return "a day ago";
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  } else if (interval === 1) {
    return "an hour ago";
  }
  7;

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes ago`;
  } else if (interval === 1) {
    return "a minute ago";
  }

  if (seconds < 1) {
    return "just now";
  }
  return `${Math.floor(seconds)} seconds ago`;
}
