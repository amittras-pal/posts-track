import { InstagramPost } from "../types";

/**
 * Copies text to the clipboard using the modern Clipboard API
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves when copy is successful
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      return new Promise((resolve, reject) => {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("Failed to copy text"));
        }
        document.body.removeChild(textArea);
      });
    }
  } catch (error) {
    throw new Error(`Failed to copy to clipboard: ${error}`);
  }
};

/**
 * Copies caption and hashtags as separate clipboard entries
 * @param post - The Instagram post to copy from
 * @param delayMs - Delay between copying caption and hashtags
 * @returns Promise that resolves when both entries are copied
 */
export const copyCaptionAndHashtagsSeparately = async (
  post: InstagramPost,
  delayMs: number = 1000
): Promise<void> => {
  const entries: string[] = [];

  if (post.caption) {
    entries.push(post.caption);
  }

  if (post.hashtags.length > 0) {
    entries.push(post.hashtags.map((tag) => `#${tag}`).join(" "));
  }

  if (entries.length === 0) {
    throw new Error("No content to copy");
  }

  // Copy entries sequentially with delay
  for (let i = 0; i < entries.length; i++) {
    await copyToClipboard(entries[i]);
    if (i < entries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
