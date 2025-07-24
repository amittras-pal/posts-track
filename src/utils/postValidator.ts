import { InstagramPost, CreateInstagramPost } from "../types";

/**
 * Validation utility for Instagram posts
 */
export class PostValidator {
  /**
   * Validates a new Instagram post before creation
   */
  static validateCreate(post: CreateInstagramPost): string[] {
    const errors: string[] = [];

    // Validate fileName
    if (!post.fileName || post.fileName.length === 0) {
      errors.push("At least one file name is required");
    } else {
      post.fileName.forEach((file, index) => {
        if (!file.trim()) {
          errors.push(`File name at index ${index} cannot be empty`);
        }
      });
    }

    // Validate caption
    if (!post.caption.trim()) {
      errors.push("Caption is required");
    } else if (post.caption.length > 2200) {
      errors.push("Caption cannot exceed 2200 characters");
    }

    // Validate hashtags
    if (post.hashtags.length > 30) {
      errors.push("Cannot have more than 30 hashtags");
    }

    post.hashtags.forEach((hashtag, index) => {
      if (!hashtag.trim()) {
        errors.push(`Hashtag at index ${index} cannot be empty`);
      } else if (hashtag.includes("#")) {
        errors.push(`Hashtag at index ${index} should not include # symbol`);
      } else if (hashtag.includes(" ")) {
        errors.push(`Hashtag at index ${index} cannot contain spaces`);
      }
    });

    // Validate people to tag
    post.peopleToTag.forEach((person, index) => {
      if (!person.trim()) {
        errors.push(`Person to tag at index ${index} cannot be empty`);
      } else if (person.includes("@")) {
        errors.push(
          `Person to tag at index ${index} should not include @ symbol`
        );
      }
    });

    return errors;
  }

  /**
   * Validates if a post can be published
   */
  static canPublish(post: InstagramPost): boolean {
    return (
      post.fileName.length > 0 &&
      post.caption.trim().length > 0 &&
      !post.isPosted
    );
  }

  /**
   * Formats hashtags with # symbol for display
   */
  static formatHashtags(hashtags: string[]): string[] {
    return hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }

  /**
   * Formats people to tag with @ symbol for display
   */
  static formatPeopleToTag(people: string[]): string[] {
    return people.map((person) =>
      person.startsWith("@") ? person : `@${person}`
    );
  }

  /**
   * Generates a preview caption with hashtags
   */
  static generatePreviewCaption(post: InstagramPost): string {
    const formattedHashtags = PostValidator.formatHashtags(post.hashtags);
    const caption = post.caption.trim();

    if (formattedHashtags.length === 0) {
      return caption;
    }

    return `${caption}\n\n${formattedHashtags.join(" ")}`;
  }
}
