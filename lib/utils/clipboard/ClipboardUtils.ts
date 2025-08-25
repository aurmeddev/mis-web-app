export class ClipboardUtils {
  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true; // Indicate success
    } catch (err) {
      console.error("Failed to copy text to clipboard:", err);
      return false; // Indicate failure
    }
  }
}
