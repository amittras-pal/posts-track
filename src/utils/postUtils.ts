import { InstagramPost, PostStatus } from "../types";

/**
 * Gets the status of a post
 */
export const getPostStatus = (post: InstagramPost): PostStatus => {
  if (post.isPosted) return "posted";
  if (post.scheduledFor && post.scheduledFor > new Date()) return "scheduled";
  return "draft";
};

/**
 * Gets posts by status
 */
export const getPostsByStatus = (
  posts: InstagramPost[],
  status: PostStatus
): InstagramPost[] => {
  if (status === "all") return posts;
  return posts.filter((post) => getPostStatus(post) === status);
};

/**
 * Counts posts by status
 */
export const getPostCounts = (posts: InstagramPost[]) => {
  return {
    all: posts.length,
    draft: posts.filter((post) => getPostStatus(post) === "draft").length,
    scheduled: posts.filter((post) => getPostStatus(post) === "scheduled")
      .length,
    posted: posts.filter((post) => getPostStatus(post) === "posted").length,
  };
};

/**
 * Gets all unique hashtags from posts
 */
export const getAllHashtags = (posts: InstagramPost[]): string[] => {
  const hashtagSet = new Set<string>();
  posts.forEach((post) => {
    post.hashtags.forEach((hashtag) => {
      hashtagSet.add(hashtag.toLowerCase());
    });
  });
  return Array.from(hashtagSet).sort();
};
