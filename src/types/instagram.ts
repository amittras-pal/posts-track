/**
 * Represents an Instagram Post entity with all necessary properties
 * for tracking and managing posts in the Instagram Tracker app
 */
export interface InstagramPost {
  /** Unique identifier for the post */
  id: string;

  /** List of file names associated with the post (images/videos) */
  fileName: string[];

  /** Caption text for the Instagram post */
  caption: string;

  /** List of hashtags to be used with the post (without # symbol) */
  hashtags: string[];

  /** List of usernames/people to tag in the post */
  peopleToTag: string[];

  /** Additional notes or comments about the post */
  notes: string;

  /** Whether the post has been published to Instagram */
  isPosted: boolean;

  /** Optional: Timestamp when the post was created */
  createdAt?: Date;

  /** Optional: Timestamp when the post was published */
  postedAt?: Date | null;

  /** Optional: Scheduled publish time */
  scheduledFor?: Date | null;
}

/**
 * Type for creating a new Instagram post (without auto-generated fields)
 */
export type CreateInstagramPost = Omit<
  InstagramPost,
  "id" | "createdAt" | "postedAt"
>;

/**
 * Type for updating an existing Instagram post (all fields optional except id)
 */
export type UpdateInstagramPost = Partial<Omit<InstagramPost, "id">> & {
  id: string;
};

/**
 * Type for Instagram post status filter
 */
export type PostStatus = "draft" | "scheduled" | "posted" | "all";
